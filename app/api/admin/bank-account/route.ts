import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bankSettings } from "@/db/schema";
import { validateBankAccount } from "@/orders/bank-account";
import { OrderError } from "@/orders/policy";
import {
  assertSameOrigin,
  readBody,
  replyError,
  requireMaster,
} from "@/orders/server";
export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireMaster(request);
    const body = await readBody(request);
    const account = validateBankAccount(body);
    if (typeof body.revision !== "string")
      throw new OrderError(400, "계좌 정보를 다시 불러와 주세요.");
    const [saved] = await getDb()
      .update(bankSettings)
      .set({
        ...account,
        revision: crypto.randomUUID(),
        updatedBy: user.id,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bankSettings.id, "primary"),
          eq(bankSettings.revision, body.revision),
        ),
      )
      .returning();
    if (!saved)
      throw new OrderError(
        409,
        "다른 곳에서 계좌가 변경되었습니다. 새로 불러온 뒤 수정해 주세요.",
      );
    return Response.json({
      ok: true,
      bankAccount: { ...account, revision: saved.revision },
    });
  } catch (e) {
    return replyError(e);
  }
}
