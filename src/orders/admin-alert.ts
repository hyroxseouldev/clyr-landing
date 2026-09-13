import { eq } from "drizzle-orm";
import type { getDb } from "../db";
import { adminOrderMessages, orderAlertSettings } from "../db/schema";
import { OrderError } from "./policy";
import { renderPaymentMessage, validateTemplate } from "./message-template";
export const DEFAULT_ORDER_ALERT =
  "[AMOR LAB 새 주문]\n{{이름}}님이 {{프로그램}} {{기간}}개월을 주문했습니다.\n입금 예정 금액: {{금액}}원\n입금 내역을 확인하고 마스터에서 입금 확인을 처리해 주세요.\n주문번호: {{주문번호}}\nhttps://www.amorlab.kr/admin";
export function validateOrderAlert(input: Record<string, unknown>) {
  if (typeof input.enabled !== "boolean")
    throw new OrderError(400, "알림 사용 여부를 선택해 주세요.");
  const recipient =
    typeof input.recipient === "string"
      ? input.recipient.replace(/[\s-]/g, "")
      : "";
  if (!/^010\d{8}$/.test(recipient))
    throw new OrderError(400, "수신 휴대폰 번호를 확인해 주세요.");
  const body = validateTemplate(input.body);
  // Validate worst-case substitution so a saved template cannot break checkout.
  renderPaymentMessage(body, {
    id: "00000000-0000-4000-8000-000000000000",
    buyer_name: "가".repeat(80),
    order_payload: {
      programName: "가".repeat(100),
      durationMonths: 3,
      totalPriceKrw: 999999999,
    },
  });
  return { enabled: input.enabled, recipient, body };
}
type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
export async function enqueueAdminOrderAlert(
  tx: Tx,
  order: Parameters<typeof renderPaymentMessage>[1],
) {
  const [settings] = await tx
    .select()
    .from(orderAlertSettings)
    .where(eq(orderAlertSettings.id, "new-order"))
    .for("share");
  if (!settings?.enabled) return;
  await tx
    .insert(adminOrderMessages)
    .values({
      id: crypto.randomUUID(),
      order_id: order.id,
      recipient: settings.recipient,
      body: renderPaymentMessage(settings.body, order),
    })
    .onConflictDoNothing();
}
