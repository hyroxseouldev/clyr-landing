import "server-only";
import { SolapiMessageService } from "solapi";
import { getDb } from "@/db";
import { adminOrderMessages } from "@/db/schema";
import { deliverOrderMessageWith } from "@/orders/delivery";
export async function deliverAdminOrderAlert(orderId: string) {
  return deliverOrderMessageWith(
    getDb(),
    adminOrderMessages,
    orderId,
    async (job) => {
      const key = process.env.SOLAPI_API_KEY,
        secret = process.env.SOLAPI_API_SECRET,
        from = process.env.SOLAPI_SENDER_NUMBER;
      if (!key || !secret || !from) return { accepted: false };
      const result = await new SolapiMessageService(key, secret).send({
        to: job.recipient,
        from,
        text: job.body,
        type: "LMS",
        subject: "AMOR LAB 새 주문",
        customFields: { orderId, notificationId: job.id },
      });
      return {
        accepted: !result.failedMessageList.length,
        providerId: result.groupInfo.groupId,
      };
    },
  );
}
