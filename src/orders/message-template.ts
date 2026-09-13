import { OrderError } from "./policy";
export const DEFAULT_PAYMENT_TEMPLATE =
  "[AMOR LAB]\n{{이름}}님, {{프로그램}} {{기간}}개월 프로그램의 입금 {{금액}}원이 확인되었습니다.\n주문번호: {{주문번호}}\n함께해 주셔서 감사합니다.";
const tokens = ["이름", "프로그램", "기간", "금액", "주문번호"];
export function validateTemplate(body: unknown): string {
  if (typeof body !== "string" || !body.trim() || body.length > 600)
    throw new OrderError(400, "문자 템플릿을 1~600자 이내로 입력해 주세요.");
  const values = Array.from(body.matchAll(/{{(.*?)}}/g), (match) => match[1]);
  if (
    values.some((value) => !tokens.includes(value)) ||
    body.replace(/{{(.*?)}}/g, "").match(/[{}]/)
  )
    throw new OrderError(400, "지원하는 치환 항목만 사용해 주세요.");
  return body.trim();
}
export function renderPaymentMessage(
  template: string,
  order: {
    id: string;
    buyer_name: string;
    order_payload: {
      programName?: string;
      durationMonths?: number;
      totalPriceKrw?: number;
    };
  },
) {
  const fields: Record<string, string> = {
    이름: order.buyer_name,
    프로그램: order.order_payload.programName || "프로그램",
    기간: String(order.order_payload.durationMonths || 1),
    금액: new Intl.NumberFormat("ko-KR").format(
      order.order_payload.totalPriceKrw || 0,
    ),
    주문번호: order.id,
  };
  const message = validateTemplate(template).replace(
    /{{(.*?)}}/g,
    (_, token) => fields[token],
  );
  if (new TextEncoder().encode(message).length > 1900)
    throw new OrderError(
      400,
      "치환 후 문자 내용이 너무 깁니다. 템플릿을 줄여 주세요.",
    );
  return message;
}
