import type { BankAccount } from "./bank-account";
import { sortedPrograms } from "../data/program-catalog";
import { getProgramPricing } from "../pricing";
import { isKoreanMobileE164, toSolapiRecipient } from "../auth/phone";

export class OrderError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type Principal = {
  id: string;
  email?: string;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
};
export function verifiedPhone(user: Principal | null) {
  if (!user) throw new OrderError(401, "휴대폰 인증 후 이용해 주세요.");
  if (!user.phoneNumberVerified || !isKoreanMobileE164(user.phoneNumber ?? ""))
    throw new OrderError(403, "휴대폰 인증을 완료해 주세요.");
  return toSolapiRecipient(user.phoneNumber!);
}
export function assertMaster(
  user: Principal | null,
  adminId: string | undefined,
) {
  if (!user) throw new OrderError(401, "관리자 로그인이 필요합니다.");
  if (!adminId || user.id !== adminId)
    throw new OrderError(403, "관리자 권한이 없습니다.");
}
export const bankAccount = {
  bankName: "국민은행",
  accountNumber: "824001-04-091290",
  holderName: "전준현",
};
export function buildOrder(
  body: Record<string, unknown>,
  user: Principal | null,
  paymentAccount: BankAccount = bankAccount,
) {
  const phone = verifiedPhone(user);
  const program = sortedPrograms.find((p) => p.id === body.programId);
  const months = body.durationMonths;
  if (
    !program ||
    !Number.isInteger(months) ||
    ![1, 2, 3].includes(months as number)
  )
    throw new OrderError(400, "프로그램과 기간을 확인해 주세요.");
  const pricing = getProgramPricing(program.id);
  if (!pricing)
    throw new OrderError(400, "현재 주문할 수 없는 프로그램입니다.");
  const buyerName =
    typeof body.buyerName === "string" ? body.buyerName.trim() : "";
  const email =
    typeof body.buyerEmail === "string" ? body.buyerEmail.trim() : "";
  const goal = typeof body.buyerGoal === "string" ? body.buyerGoal.trim() : "";
  if (
    !buyerName ||
    buyerName.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    goal.length > 2000 ||
    body.agreement !== true
  )
    throw new OrderError(400, "주문자 정보와 동의 항목을 확인해 주세요.");
  if (
    typeof body.requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.requestId,
    )
  )
    throw new OrderError(400, "주문 요청을 새로 시작해 주세요.");
  return {
    id: body.requestId,
    buyer_name: buyerName,
    buyer_phone: phone,
    buyer_phone_normalized: phone,
    status: "pending",
    order_payload: {
      programId: program.id,
      programName: program.title,
      storeName: "AMOR LAB 랜딩",
      buyerEmail: email,
      buyerGoal: goal,
      paymentMethod: "bank",
      pricingPhase: pricing.pricingPhase,
      regularPriceKrw: pricing.regularPriceKrw,
      finalPriceKrw: pricing.finalPriceKrw,
      regularTotalPriceKrw: pricing.regularPriceKrw * (months as number),
      monthlyPriceKrw: pricing.finalPriceKrw,
      durationMonths: months as number,
      totalPriceKrw: pricing.finalPriceKrw * (months as number),
      bankAccount: {
        bankName: paymentAccount.bankName,
        accountNumber: paymentAccount.accountNumber,
        holderName: paymentAccount.holderName,
      },
      authUserId: user!.id,
      phoneVerified: true,
    },
  };
}
export type OrderRow = {
  alert?: {
    status: "pending" | "sending" | "accepted" | "failed" | "unknown";
    recipient: string;
  } | null;
  grant?: {
    status: "pending" | "sending" | "waiting" | "claimed" | "failed";
    startsAt?: string | null;
    endsAt?: string | null;
  } | null;
  message?: {
    status: "pending" | "sending" | "accepted" | "failed" | "unknown";
    providerId?: string | null;
  } | null;
  id: string;
  buyer_name: string;
  buyer_phone: string;
  status: "pending" | "confirmed" | "canceled";
  created_at: string;
  confirmed_at: string | null;
  canceled_at: string | null;
  order_payload: {
    bankAccount?: BankAccount;
    programId?: string;
    programName?: string;
    buyerEmail?: string;
    buyerGoal?: string;
    totalPriceKrw?: number;
    durationMonths?: number;
    authUserId?: string;
    phoneVerified?: boolean;
  };
};
