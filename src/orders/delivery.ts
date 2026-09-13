import { and, eq, inArray, sql } from "drizzle-orm";
import type { getDb } from "../db";
import { orderMessages, adminOrderMessages } from "../db/schema";
export type PaymentTransport = (job: {
  id: string;
  recipient: string;
  body: string;
  order_id: string;
}) => Promise<{ accepted: boolean; providerId?: string }>;
// Claim before sending. Never retry an ambiguous network failure automatically.
export async function deliverPaymentMessageWith(
  db: ReturnType<typeof getDb>,
  orderId: string,
  transport: PaymentTransport,
) {
  return deliverOrderMessageWith(db, orderMessages, orderId, transport);
}
export async function deliverOrderMessageWith(
  db: ReturnType<typeof getDb>,
  table: typeof orderMessages | typeof adminOrderMessages,
  orderId: string,
  transport: PaymentTransport,
) {
  const [job] = await db
    .update(table)
    .set({
      status: "sending",
      attempts: sql`${table.attempts} + 1`,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(table.order_id, orderId),
        inArray(table.status, ["pending", "failed"]),
      ),
    )
    .returning();
  if (!job) return;
  let outcome: "accepted" | "failed" | "unknown" = "unknown";
  let providerId: string | null = null;
  try {
    const result = await transport(job);
    outcome = result.accepted ? "accepted" : "failed";
    providerId = result.providerId ?? null;
  } catch {
    outcome = "unknown";
  }
  await db
    .update(table)
    .set({ status: outcome, provider_id: providerId, updated_at: new Date() })
    .where(eq(table.id, job.id));
  return outcome;
}
