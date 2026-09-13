import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bankSettings } from "@/db/schema";
import { OrderError } from "@/orders/policy";
import { replyError } from "@/orders/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [bankAccount] = await getDb()
      .select({
        bankName: bankSettings.bankName,
        accountNumber: bankSettings.accountNumber,
        holderName: bankSettings.holderName,
        revision: bankSettings.revision,
      })
      .from(bankSettings)
      .where(eq(bankSettings.id, "primary"));
    if (!bankAccount)
      throw new OrderError(
        503,
        "입금 계좌를 준비 중입니다. 잠시 후 다시 시도해 주세요.",
      );
    return Response.json(
      { bankAccount },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return replyError(e);
  }
}
