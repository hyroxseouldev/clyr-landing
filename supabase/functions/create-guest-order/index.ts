import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "jsr:@supabase/supabase-js@2";

type GuestOrderRequest = {
  tenantId?: unknown;
  buyerName?: unknown;
  buyerPhone?: unknown;
  orderPayload?: unknown;
};

type ProgramPricing = {
  regularPriceKrw: number;
  earlyBirdPriceKrw: number;
};

const EARLY_BIRD_END_AT_MS = Date.parse("2026-06-06T15:00:00.000Z");
const PROGRAM_PRICING: Record<string, ProgramPricing> = {
  "06a42964-2aa4-4287-a724-32fb8526e2df": {
    regularPriceKrw: 150000,
    earlyBirdPriceKrw: 105000,
  },
  "0d925d9f-bdb1-4e34-ae70-5609faa20983": {
    regularPriceKrw: 300000,
    earlyBirdPriceKrw: 210000,
  },
  "8f81d9f1-8559-4fd8-bbe9-c49779770461": {
    regularPriceKrw: 200000,
    earlyBirdPriceKrw: 160000,
  },
  "c881344f-267c-4aa4-ad49-008e4275ec1f": {
    regularPriceKrw: 200000,
    earlyBirdPriceKrw: 140000,
  },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("GUEST_ORDER_ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function assertEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
}

function getServerPricing(programId: string, durationMonths: number) {
  const pricing = PROGRAM_PRICING[programId];
  if (!pricing) return null;

  const pricingPhase = Date.now() < EARLY_BIRD_END_AT_MS ? "early_bird" : "regular";
  const finalPriceKrw = pricingPhase === "early_bird" ? pricing.earlyBirdPriceKrw : pricing.regularPriceKrw;

  return {
    pricingPhase,
    regularPriceKrw: pricing.regularPriceKrw,
    finalPriceKrw,
    regularTotalPriceKrw: pricing.regularPriceKrw * durationMonths,
    totalPriceKrw: finalPriceKrw * durationMonths,
    monthlyPriceKrw: finalPriceKrw,
  };
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return json(405, { ok: false, message: "Method not allowed" });
    }

    const body = (await req.json().catch(() => null)) as GuestOrderRequest | null;
    if (!body || !isPlainRecord(body)) {
      return json(400, { ok: false, message: "요청 형식이 올바르지 않습니다." });
    }

    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const buyerName = typeof body.buyerName === "string" ? body.buyerName.trim() : "";
    const buyerPhone = typeof body.buyerPhone === "string" ? body.buyerPhone.trim() : "";
    const buyerPhoneNormalized = normalizePhoneNumber(buyerPhone);
    const orderPayload = isPlainRecord(body.orderPayload) ? body.orderPayload : null;

    if (!tenantId) {
      return json(400, { ok: false, message: "테넌트 정보가 누락되었습니다." });
    }

    if (!isUuid(tenantId)) {
      return json(400, { ok: false, message: "테넌트 정보가 올바르지 않습니다." });
    }

    if (!buyerName) {
      return json(400, { ok: false, message: "주문자명을 입력해 주세요." });
    }

    if (buyerPhoneNormalized.length < 9 || buyerPhoneNormalized.length > 12) {
      return json(400, { ok: false, message: "핸드폰 번호를 올바르게 입력해 주세요." });
    }

    if (!orderPayload) {
      return json(400, { ok: false, message: "주문 정보가 올바르지 않습니다." });
    }

    const programId = typeof orderPayload.programId === "string" ? orderPayload.programId.trim() : "";
    const durationMonths = toInteger(orderPayload.durationMonths);
    const clientMonthlyPriceKrw = toInteger(orderPayload.monthlyPriceKrw);
    const clientTotalPriceKrw = toInteger(orderPayload.totalPriceKrw);

    if (!programId || !PROGRAM_PRICING[programId]) {
      return json(400, { ok: false, message: "프로그램 정보가 올바르지 않습니다." });
    }

    if (!durationMonths || ![1, 2, 3].includes(durationMonths)) {
      return json(400, { ok: false, message: "수강 기간이 올바르지 않습니다." });
    }

    const serverPricing = getServerPricing(programId, durationMonths);
    if (!serverPricing) {
      return json(400, { ok: false, message: "가격 정보를 확인할 수 없습니다." });
    }

    if (clientMonthlyPriceKrw !== serverPricing.monthlyPriceKrw || clientTotalPriceKrw !== serverPricing.totalPriceKrw) {
      return json(400, { ok: false, message: "가격 정보가 변경되었습니다. 페이지를 새로고침한 뒤 다시 주문해 주세요." });
    }

    const sanitizedOrderPayload = {
      ...orderPayload,
      programId,
      pricingPhase: serverPricing.pricingPhase,
      regularPriceKrw: serverPricing.regularPriceKrw,
      finalPriceKrw: serverPricing.finalPriceKrw,
      regularTotalPriceKrw: serverPricing.regularTotalPriceKrw,
      monthlyPriceKrw: serverPricing.monthlyPriceKrw,
      durationMonths,
      totalPriceKrw: serverPricing.totalPriceKrw,
    };

    const supabase = createClient(assertEnv("SUPABASE_URL"), assertEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .maybeSingle<{ id: string }>();

    if (tenantError) {
      return json(500, { ok: false, message: tenantError.message });
    }

    if (!tenant) {
      return json(400, { ok: false, message: "유효하지 않은 테넌트입니다." });
    }

    const { data: order, error } = await supabase
      .from("guest_orders")
      .insert({
        tenant_id: tenant.id,
        status: "pending",
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_phone_normalized: buyerPhoneNormalized,
        order_payload: sanitizedOrderPayload,
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error || !order) {
      return json(500, { ok: false, message: error?.message ?? "게스트 주문 접수에 실패했습니다." });
    }

    return json(200, { ok: true, orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json(500, { ok: false, message });
  }
});
