import "server-only";
import { getDb } from "@/db";
import { finishReversalWith } from "./reversal";
export async function finishReversal(id: string) {
  return finishReversalWith(getDb(), id, async (job, grant) => {
    const url = process.env.MOBILE_SUPABASE_URL;
    const key = process.env.MOBILE_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Mobile connection unavailable");
    const response = await fetch(
      `${url}/rest/v1/rpc/revoke_amor_landing_grant`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_order_id: job.issuance_id,
          p_program_id: grant.program_id,
          p_phone: grant.phone,
          p_duration_months: grant.duration_months,
        }),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Mobile reversal failed");
    const data = await response.json();
    if (data.orderId !== job.issuance_id || data.status !== "revoked")
      throw new Error("Invalid reversal result");
  });
}
