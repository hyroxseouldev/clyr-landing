"use client";
import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";
import { normalizeKoreanMobile } from "./phone";

export const authClient = createAuthClient({ plugins: [phoneNumberClient()] });
export const { useSession, signOut } = authClient;

export function sendPhoneOtp(phone: string) {
  return authClient.phoneNumber.sendOtp({
    phoneNumber: normalizeKoreanMobile(phone),
  });
}
export function verifyPhoneOtp(phone: string, code: string) {
  return authClient.phoneNumber.verify({
    phoneNumber: normalizeKoreanMobile(phone),
    code,
    disableSession: false,
  });
}
