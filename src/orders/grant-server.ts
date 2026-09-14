import "server-only";
import { getDb } from "@/db";
import { deliverGrantWith } from "./grant-delivery";
import { deliverPaymentMessage } from "@/sms/payment-message";
export async function fulfillOrder(orderId: string) {
  const grantStatus = await deliverGrantWith(getDb(), orderId, async (job) => {
    const url = process.env.MOBILE_SUPABASE_URL;
    const key = process.env.MOBILE_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Mobile grant connection unavailable");
    const response = await fetch(
      `${url}/rest/v1/rpc/upsert_amor_landing_grant`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_order_id: job.issuance_id ?? job.order_id,
          p_program_id: job.program_id,
          p_phone: job.phone,
          p_duration_months: job.duration_months,
        }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Mobile grant request failed");
    const data = await response.json();
    if (
      data.orderId !== (job.issuance_id ?? job.order_id) ||
      !["waiting", "claimed"].includes(data.status)
    )
      throw new Error("Invalid grant response");
    if (
      data.status === "claimed" &&
      (!data.startsAt ||
        !Number.isFinite(Date.parse(data.startsAt)) ||
        (data.endsAt !== null && !Number.isFinite(Date.parse(data.endsAt))))
    )
      throw new Error("Invalid grant dates");
    return {
      status: data.status,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    };
  });
  let messageStatus;
  if (grantStatus === "waiting" || grantStatus === "claimed") {
    try {
      messageStatus = await deliverPaymentMessage(orderId);
    } catch {
      messageStatus = "unknown";
    }
  }
  return { grantStatus, messageStatus };
}
