import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderReversals } from "@/db/schema";
import { OrderError } from "@/orders/policy";
import { beginReversal } from "@/orders/reversal";
import { finishReversal } from "@/orders/reversal-server";
import {
  assertSameOrigin,
  readBody,
  replyError,
  requireMaster,
} from "@/orders/server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const actor = await requireMaster(request);
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id))
      throw new OrderError(400, "잘못된 주문번호입니다.");
    const body = await readBody(request);
    const job =
      body.retry === true
        ? (
            await getDb()
              .select()
              .from(orderReversals)
              .where(eq(orderReversals.order_id, id))
              .orderBy(desc(orderReversals.created_at))
              .limit(1)
          )[0]
        : await beginReversal(getDb(), id, actor.id, body);
    if (!job) throw new OrderError(404, "회수 요청을 찾을 수 없습니다.");
    const reversalStatus = await finishReversal(job.id);
    return Response.json(
      { ok: true, reversalStatus },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return replyError(error);
  }
}
