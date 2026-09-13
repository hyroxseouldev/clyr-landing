import { toSolapiRecipient } from "../auth/phone";

export type SmsTransport = (message: {
  to: string;
  from: string;
  text: string;
  type: "SMS";
}) => Promise<{ failedMessageList: readonly unknown[] }>;

export function createOtpSender(from: string, transport: SmsTransport) {
  if (!/^\d{8,11}$/.test(from))
    throw new Error(
      "SOLAPI_SENDER_NUMBER must be a registered digits-only sender number",
    );
  return async ({
    phoneNumber,
    code,
  }: {
    phoneNumber: string;
    code: string;
  }) => {
    if (!/^\d{6}$/.test(code)) throw new Error("Invalid OTP format");
    const message = {
      to: toSolapiRecipient(phoneNumber),
      from,
      text: `[AMOR LAB] 인증번호 [${code}]를 입력해 주세요. 3분 내 유효합니다.`,
      type: "SMS" as const,
    };
    try {
      const result = await transport(message);
      if (result.failedMessageList.length) throw new Error("SMS rejected");
    } catch {
      // Do not expose provider errors containing phone numbers, OTPs or credentials.
      throw new Error(
        "인증문자 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };
}
