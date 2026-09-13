import { and, eq, inArray, sql } from "drizzle-orm";
import type { getDb } from "../db";
import { orderMessages } from "../db/schema";
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
  const [job] = await db
    .update(orderMessages)
    .set({
      status: "sending",
      attempts: sql`${orderMessages.attempts} + 1`,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(orderMessages.order_id, orderId),
        inArray(orderMessages.status, ["pending", "failed"]),
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
    .update(orderMessages)
    .set({ status: outcome, provider_id: providerId, updated_at: new Date() })
    .where(eq(orderMessages.id, job.id));
  return outcome;
}
