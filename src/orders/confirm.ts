import { and, eq } from "drizzle-orm";
import type { getDb } from "../db";
import {
  orders,
  orderEvents,
  messageTemplates,
  orderMessages,
  orderGrants,
} from "../db/schema";
import { OrderError } from "./policy";
import { renderPaymentMessage } from "./message-template";
export async function changeOrderStatus(
  db: ReturnType<typeof getDb>,
  id: string,
  actorId: string,
  status: "confirmed" | "canceled",
) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(orders)
      .set({
        status,
        updated_at: new Date(),
        ...(status === "confirmed"
          ? { confirmed_at: new Date() }
          : { canceled_at: new Date() }),
      })
      .where(and(eq(orders.id, id), eq(orders.status, "pending")))
      .returning();
    if (!row)
      throw new OrderError(
        409,
        "이미 처리되었거나 찾을 수 없는 주문입니다. 목록을 새로고침해 주세요.",
      );
    if (status === "confirmed") {
      const [template] = await tx
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.id, "payment-confirmed"));
      if (!template)
        throw new OrderError(
          409,
          "입금 확인 안내 문자 템플릿을 먼저 저장해 주세요.",
        );
      const recipient = row.buyer_phone_normalized;
      if (!/^010\d{8}$/.test(recipient))
        throw new OrderError(400, "문자 수신번호를 확인할 수 없는 주문입니다.");
      const programId = row.order_payload.programId;
      const months = row.order_payload.durationMonths;
      if (!programId || !Number.isInteger(months) || months! < 1 || months! > 3)
        throw new OrderError(
          400,
          "프로그램과 이용 기간을 확인할 수 없는 주문입니다.",
        );
      // A restored pending order starts a new issuance; old reversals retain its ID.
      await tx.delete(orderGrants).where(eq(orderGrants.order_id, id));
      await tx.delete(orderMessages).where(eq(orderMessages.order_id, id));
      await tx.insert(orderGrants).values({
        order_id: id,
        issuance_id: crypto.randomUUID(),
        program_id: programId,
        phone: recipient,
        duration_months: months!,
      });
      await tx.insert(orderMessages).values({
        id: crypto.randomUUID(),
        order_id: id,
        recipient,
        body: renderPaymentMessage(template.body, row),
      });
    }
    await tx.insert(orderEvents).values({
      id: crypto.randomUUID(),
      order_id: id,
      actor_id: actorId,
      status,
    });
    return { id: row.id, status: row.status };
  });
}
