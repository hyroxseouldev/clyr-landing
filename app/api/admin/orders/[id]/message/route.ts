import { deliverPaymentMessage } from "@/sms/payment-message";
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
    const status = await deliverPaymentMessage(id);
    if (!status)
      throw new OrderError(
        409,
        "이미 처리 중이거나 재발송할 수 없는 문자입니다.",
      );
    return Response.json({ ok: true, messageStatus: status });
  } catch (error) {
    return replyError(error);
  }
}
