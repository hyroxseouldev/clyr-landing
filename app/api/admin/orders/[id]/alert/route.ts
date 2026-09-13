import { deliverAdminOrderAlert } from "@/sms/admin-order-alert";
import { assertSameOrigin, replyError, requireMaster } from "@/orders/server";
import { OrderError } from "@/orders/policy";
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
    const status = await deliverAdminOrderAlert(id);
    if (!status)
      throw new OrderError(
        409,
        "이미 처리 중이거나 재발송할 수 없는 알림입니다.",
      );
    return Response.json({ ok: true, alertStatus: status });
  } catch (e) {
    return replyError(e);
  }
}
