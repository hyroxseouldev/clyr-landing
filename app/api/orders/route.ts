import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, bankSettings } from "@/db/schema";
import { buildOrder, OrderError, verifiedPhone } from "@/orders/policy";
import {
  assertSameOrigin,
  readBody,
  replyError,
  requirePhone,
} from "@/orders/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requirePhone(request);
    const body = await readBody(request);
    const db = getDb();
    return await db.transaction(async (tx) => {
      const [account] = await tx
        .select()
        .from(bankSettings)
        .where(eq(bankSettings.id, "primary"))
        .for("share");
      if (!account) throw new OrderError(503, "입금 계좌를 준비 중입니다.");
      if (body.bankRevision !== account.revision)
        throw new OrderError(
          409,
          "입금 계좌가 변경되었습니다. 새로고침 후 계좌를 확인하고 다시 주문해 주세요.",
        );
      const order = buildOrder(body, user, account);
      const inserted = await tx
        .insert(orders)
        .values({ ...order, status: "pending", user_id: user.id })
        .onConflictDoNothing()
        .returning({ id: orders.id });
      let savedAccount = order.order_payload.bankAccount;
      if (!inserted.length) {
        const [existing] = await tx
          .select({
            user_id: orders.user_id,
            order_payload: orders.order_payload,
          })
          .from(orders)
          .where(eq(orders.id, order.id));
        if (existing?.user_id !== user.id)
          throw new OrderError(409, "이미 처리된 주문 요청입니다.");
        savedAccount = existing.order_payload.bankAccount ?? savedAccount;
      }
      return Response.json(
        { ok: true, orderId: order.id, bankAccount: savedAccount },
        { status: inserted.length ? 201 : 200 },
      );
    });
  } catch (error) {
    return replyError(error);
  }
}
export async function GET(request: Request) {
  try {
    const user = await requirePhone(request);
    const rows = await getDb()
      .select()
      .from(orders)
      .where(eq(orders.buyer_phone_normalized, verifiedPhone(user)))
      .orderBy(desc(orders.created_at))
      .limit(50);
    return Response.json(
      {
        ok: true,
        orders: rows.map((row) => ({
          id: row.id,
          status: row.status,
          created_at: row.created_at,
          order_payload: {
            bankAccount: row.order_payload.bankAccount,
            programName: row.order_payload.programName,
            totalPriceKrw: row.order_payload.totalPriceKrw,
            durationMonths: row.order_payload.durationMonths,
          },
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return replyError(error);
  }
}
