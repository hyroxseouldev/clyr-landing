import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import type { getDb } from "../db";
import {
  orders,
  orderEvents,
  orderGrants,
  orderMessages,
  orderReversals,
} from "../db/schema";
import { OrderError } from "./policy";

type Db = ReturnType<typeof getDb>;
export type ReversalJob = typeof orderReversals.$inferSelect;
export function validateReversal(body: Record<string, unknown>) {
  if (body.kind !== "undo" && body.kind !== "refund")
    throw new OrderError(400, "처리 유형을 확인해 주세요.");
  if (
    typeof body.reason !== "string" ||
    !body.reason.trim() ||
    body.reason.trim().length > 500
  )
    throw new OrderError(400, "처리 사유를 1~500자로 입력해 주세요.");
  if (body.kind === "refund" && body.refundTransferred !== true)
    throw new OrderError(400, "실제 환불 송금을 완료한 뒤 처리해 주세요.");
  return {
    kind: body.kind,
    reason: body.reason.trim(),
    manualAccessReviewed: body.manualAccessReviewed === true,
  } as const;
}
export async function beginReversal(
  db: Db,
  orderId: string,
  actorId: string,
  body: Record<string, unknown>,
) {
  const input = validateReversal(body);
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .for("update");
    if (!order) throw new OrderError(404, "주문을 찾을 수 없습니다.");
    if (order.status === "reversing") {
      const [job] = await tx
        .select()
        .from(orderReversals)
        .where(eq(orderReversals.order_id, orderId))
        .orderBy(desc(orderReversals.created_at))
        .limit(1);
      if (job?.kind === input.kind && job.status !== "done") return job;
      throw new OrderError(409, "진행 중인 회수 처리를 먼저 완료해 주세요.");
    }
    if (order.status !== "confirmed")
      throw new OrderError(409, "입금 확인된 주문만 처리할 수 있습니다.");
    const [grant] = await tx
      .select()
      .from(orderGrants)
      .where(eq(orderGrants.order_id, orderId));
    const [message] = await tx
      .select()
      .from(orderMessages)
      .where(eq(orderMessages.order_id, orderId));
    if (message?.status === "sending")
      throw new OrderError(
        409,
        "입금 안내 문자가 발송 처리 중입니다. 발송 결과를 확인한 뒤 다시 처리해 주세요.",
      );
    if (!grant && !input.manualAccessReviewed)
      throw new OrderError(
        409,
        "이관 주문입니다. 앱 이용권을 직접 확인·회수했거나 회수 대상이 없는지 확인해 주세요.",
      );
    const [job] = await tx
      .insert(orderReversals)
      .values({
        id: crypto.randomUUID(),
        order_id: orderId,
        issuance_id: grant ? (grant.issuance_id ?? orderId) : null,
        actor_id: actorId,
        kind: input.kind,
        reason: input.reason,
        manual_access_reviewed: !grant && input.manualAccessReviewed,
      })
      .returning();
    await tx
      .update(orders)
      .set({ status: "reversing", updated_at: new Date() })
      .where(eq(orders.id, orderId));
    // Invalidate an in-flight delivery; the remote tombstone also rejects late RPCs.
    if (grant)
      await tx
        .update(orderGrants)
        .set({ status: "revoked", lease: null, updated_at: new Date() })
        .where(eq(orderGrants.order_id, orderId));
    await tx
      .insert(orderEvents)
      .values({
        id: crypto.randomUUID(),
        order_id: orderId,
        actor_id: actorId,
        status: input.kind === "undo" ? "undo_requested" : "refund_requested",
        reason: input.reason,
      });
    return job;
  });
}
export async function finishReversalWith(
  db: Db,
  id: string,
  transport: (
    job: ReversalJob,
    grant: typeof orderGrants.$inferSelect,
  ) => Promise<void>,
) {
  const lease = crypto.randomUUID();
  const [job] = await db
    .update(orderReversals)
    .set({ status: "sending", lease, updated_at: new Date() })
    .where(
      and(
        eq(orderReversals.id, id),
        or(
          inArray(orderReversals.status, ["pending", "failed"]),
          and(
            eq(orderReversals.status, "sending"),
            lt(orderReversals.updated_at, new Date(Date.now() - 180000)),
          ),
        ),
      ),
    )
    .returning();
  if (!job)
    return (
      await db.select().from(orderReversals).where(eq(orderReversals.id, id))
    )[0]?.status;
  try {
    if (job.issuance_id) {
      const [grant] = await db
        .select()
        .from(orderGrants)
        .where(
          and(
            eq(orderGrants.order_id, job.order_id),
            sql`coalesce(${orderGrants.issuance_id}, ${orderGrants.order_id}) = ${job.issuance_id}`,
          ),
        );
      if (!grant) throw new Error("Grant issuance mismatch");
      await transport(job, grant);
    }
    await db.transaction(async (tx) => {
      await tx
        .select()
        .from(orders)
        .where(eq(orders.id, job.order_id))
        .for("update");
      const [finished] = await tx
        .update(orderReversals)
        .set({ status: "done", lease: null, updated_at: new Date() })
        .where(and(eq(orderReversals.id, id), eq(orderReversals.lease, lease)))
        .returning();
      if (!finished) return;
      const status = job.kind === "undo" ? "pending" : "refunded";
      await tx
        .update(orders)
        .set({
          status,
          updated_at: new Date(),
          ...(job.kind === "undo" ? { confirmed_at: null } : {}),
        })
        .where(
          and(eq(orders.id, job.order_id), eq(orders.status, "reversing")),
        );
      await tx
        .insert(orderEvents)
        .values({
          id: crypto.randomUUID(),
          order_id: job.order_id,
          actor_id: job.actor_id,
          status: job.kind === "undo" ? "confirmation_undone" : "refunded",
          reason: job.reason,
        });
    });
    return (
      await db.select().from(orderReversals).where(eq(orderReversals.id, id))
    )[0]?.status;
  } catch {
    await db
      .update(orderReversals)
      .set({ status: "failed", lease: null, updated_at: new Date() })
      .where(and(eq(orderReversals.id, id), eq(orderReversals.lease, lease)));
    return "failed";
  }
}
