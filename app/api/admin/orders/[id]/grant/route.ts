import { fulfillOrder } from "@/orders/grant-server";
import { assertSameOrigin, replyError, requireMaster } from "@/orders/server";
import { OrderError } from "@/orders/policy";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireMaster(request);
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id))
      throw new OrderError(400, "잘못된 주문번호입니다.");
    const result = await fulfillOrder(id);
    if (!result.grantStatus)
      throw new OrderError(404, "발급 요청을 찾을 수 없습니다.");
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return replyError(error);
  }
}
