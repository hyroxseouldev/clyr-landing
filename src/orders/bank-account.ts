import { OrderError } from "./policy";
export type BankAccount = {
  bankName: string;
  accountNumber: string;
  holderName: string;
};
export function validateBankAccount(value: unknown): BankAccount {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new OrderError(400, "입금 계좌 정보를 확인해 주세요.");
  const input = value as Record<string, unknown>;
  const bankName =
    typeof input.bankName === "string" ? input.bankName.trim() : "";
  const accountNumber =
    typeof input.accountNumber === "string" ? input.accountNumber.trim() : "";
  const holderName =
    typeof input.holderName === "string" ? input.holderName.trim() : "";
  if (
    !bankName ||
    bankName.length > 40 ||
    !holderName ||
    holderName.length > 80 ||
    /[\r\n\x00-\x1f]/.test(bankName + holderName) ||
    !/^[0-9]+(?:[- ][0-9]+)*$/.test(accountNumber) ||
    accountNumber.length > 40 ||
    accountNumber.replace(/\D/g, "").length < 8 ||
    accountNumber.replace(/\D/g, "").length > 24
  )
    throw new OrderError(
      400,
      "은행명, 계좌번호(숫자 8~24자리), 예금주를 올바르게 입력해 주세요.",
    );
  return { bankName, accountNumber, holderName };
}
