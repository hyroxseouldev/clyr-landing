import "server-only";
import { eq } from "drizzle-orm";
import { orderGrants } from "@/db/schema";
import { SolapiMessageService } from "solapi";
import { getDb } from "@/db";
import { deliverPaymentMessageWith } from "@/orders/delivery";
export async function deliverPaymentMessage(orderId: string) {
  const [grant] = await getDb()
    .select()
    .from(orderGrants)
    .where(eq(orderGrants.order_id, orderId));
  if (grant && !["waiting", "claimed"].includes(grant.status)) return;
  return deliverPaymentMessageWith(getDb(), orderId, async (job) => {
    const key = process.env.SOLAPI_API_KEY,
      secret = process.env.SOLAPI_API_SECRET,
      from = process.env.SOLAPI_SENDER_NUMBER;
    if (!key || !secret || !from) return { accepted: false };
    const result = await new SolapiMessageService(key, secret).send({
      to: job.recipient,
      from,
      text: job.body,
      type: "LMS",
      subject: "AMOR LAB 입금 확인",
      customFields: { orderId, notificationId: job.id },
    });
    return {
      accepted: !result.failedMessageList.length,
      providerId: result.groupInfo.groupId,
    };
  });
}
