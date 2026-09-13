import { and, eq, inArray, lt, or, sql } from "drizzle-orm";
import type { getDb } from "../db";
import { orderGrants } from "../db/schema";
export type GrantJob = typeof orderGrants.$inferSelect;
export type GrantResult = {
  status: "waiting" | "claimed";
  startsAt: string | null;
  endsAt: string | null;
};
export async function deliverGrantWith(
  db: ReturnType<typeof getDb>,
  orderId: string,
  transport: (job: GrantJob) => Promise<GrantResult>,
) {
  const lease = crypto.randomUUID();
  const [job] = await db
    .update(orderGrants)
    .set({
      status: "sending",
      lease,
      attempts: sql`${orderGrants.attempts}+1`,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(orderGrants.order_id, orderId),
        or(
          inArray(orderGrants.status, ["pending", "failed", "waiting"]),
          and(
            eq(orderGrants.status, "sending"),
            lt(orderGrants.updated_at, new Date(Date.now() - 180000)),
          ),
        ),
      ),
    )
    .returning();
  if (!job)
    return (
      await db
        .select()
        .from(orderGrants)
        .where(eq(orderGrants.order_id, orderId))
    )[0]?.status;
  let result: GrantResult | undefined;
  // The mobile RPC is idempotent even if the response was lost after committing.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result = await transport(job);
      break;
    } catch {
      /* Leave durable failure for master retry. */
    }
  }
  const status = result?.status ?? "failed";
  await db
    .update(orderGrants)
    .set({
      status,
      lease: null,
      starts_at: result?.startsAt ? new Date(result.startsAt) : null,
      ends_at: result?.endsAt ? new Date(result.endsAt) : null,
      updated_at: new Date(),
    })
    .where(
      and(eq(orderGrants.order_id, orderId), eq(orderGrants.lease, lease)),
    );
  return status;
}
