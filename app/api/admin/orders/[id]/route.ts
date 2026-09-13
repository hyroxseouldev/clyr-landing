import { getDb } from "@/db";
import { OrderError } from "@/orders/policy";
import { changeOrderStatus } from "@/orders/confirm";
import { fulfillOrder } from "@/orders/grant-server";
import {
  assertSameOrigin,
  readBody,
  replyError,
  requireMaster,
} from "@/orders/server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const actor = await requireMaster(request);
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id))
      throw new OrderError(400, "잘못된 주문번호입니다.");
    const { status } = await readBody(request);
    if (status !== "confirmed" && status !== "canceled")
      throw new OrderError(400, "지원하지 않는 주문 상태입니다.");
    const order = await changeOrderStatus(getDb(), id, actor.id, status);
    const fulfillment =
      status === "confirmed"
        ? await fulfillOrder(id).catch(() => ({ grantStatus: "failed" }))
        : {};
    return Response.json({ ok: true, order, ...fulfillment });
  } catch (error) {
    return replyError(error);
  }
}
