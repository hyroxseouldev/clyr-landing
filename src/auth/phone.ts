/** Store only Korean mobile numbers in canonical E.164 form. */
export function isKoreanMobileE164(value: string): boolean {
  return /^\+8210\d{8}$/.test(value);
}

export function normalizeKoreanMobile(value: string): string {
  if (!/^[+\d\s()-]+$/.test(value))
    throw new Error("올바른 010 휴대폰 번호를 입력해 주세요.");
  const compact = value.replace(/[\s()-]/g, "");
  const canonical = /^010\d{8}$/.test(compact)
    ? `+82${compact.slice(1)}`
    : compact;
  if (!isKoreanMobileE164(canonical))
    throw new Error("올바른 010 휴대폰 번호를 입력해 주세요.");
  return canonical;
}

export function toSolapiRecipient(value: string): string {
  return `0${normalizeKoreanMobile(value).slice(3)}`;
}
