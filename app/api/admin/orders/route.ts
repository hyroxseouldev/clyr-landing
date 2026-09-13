import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, orderMessages, orderGrants } from "@/db/schema";
import { replyError, requireMaster } from "@/orders/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await requireMaster(request);
    const query = new URL(request.url).searchParams;
    const page = Math.floor(
      Math.max(1, Math.min(100000, Number(query.get("page")) || 1)),
    );
    const status = query.get("status");
    const search = (query.get("q") || "")
      .trim()
      .slice(0, 80)
      .replace(/[%_\\]/g, "\\$&");
    const where = and(
      status === "pending" || status === "confirmed" || status === "canceled"
        ? eq(orders.status, status)
        : undefined,
      search
        ? or(
            ilike(orders.buyer_name, `%${search}%`),
            ilike(
              orders.buyer_phone_normalized,
              `%${search.replace(/\s|-/g, "")}%`,
            ),
          )
        : undefined,
    );
    const db = getDb();
    const [rows, totals] = await Promise.all([
      db
        .select({
          order: orders,
          grant: {
            status: orderGrants.status,
            startsAt: orderGrants.starts_at,
            endsAt: orderGrants.ends_at,
          },
          message: {
            status: orderMessages.status,
            providerId: orderMessages.provider_id,
          },
        })
        .from(orders)
        .leftJoin(orderMessages, eq(orders.id, orderMessages.order_id))
        .leftJoin(orderGrants, eq(orders.id, orderGrants.order_id))
        .where(where)
        .orderBy(desc(orders.created_at), desc(orders.id))
        .limit(25)
        .offset((page - 1) * 25),
      db.select({ total: count() }).from(orders).where(where),
    ]);
    return Response.json(
      {
        ok: true,
        orders: rows.map((row) => ({
          ...row.order,
          message: row.message,
          grant: row.grant,
        })),
        total: totals[0].total,
        page,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return replyError(error);
  }
}
