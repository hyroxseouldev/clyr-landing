import { createHmac } from "node:crypto";
import { betterAuth } from "better-auth/minimal";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { isKoreanMobileE164 } from "./phone";

// Dependencies are explicit so OTP/session behavior can be tested without paid SMS or a live DB.
export function createAuth(config: {
  database: ReturnType<typeof drizzleAdapter>;
  secret: string;
  baseURL: string;
  sendOTP: (data: { phoneNumber: string; code: string }) => Promise<void>;
}) {
  return betterAuth({
    appName: "AMOR LAB",
    database: config.database,
    secret: config.secret,
    baseURL: config.baseURL,
    basePath: "/api/auth",
    trustedOrigins: [new URL(config.baseURL).origin],
    // Vercel overwrites this header. Other hosting must supply a trusted proxy.
    advanced: { ipAddress: { ipAddressHeaders: ["x-forwarded-for"] } },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        const origin = ctx.request?.headers.get("origin");
        if (origin && origin !== new URL(config.baseURL).origin) {
          throw new APIError("FORBIDDEN", {
            message: "허용되지 않은 요청 출처입니다.",
          });
        }
      }),
    },
    emailAndPassword: { enabled: true, minPasswordLength: 10 },
    // Only provisioned staff use email/password; public signup stays disabled.
    disabledPaths: [
      "/sign-up/email",
      "/sign-in/phone-number",
      "/phone-number/request-password-reset",
      "/phone-number/reset-password",
    ],
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/phone-number/send-otp": { window: 60, max: 1 },
        "/phone-number/verify": { window: 60, max: 5 },
      },
    },
    plugins: [
      phoneNumber({
        otpLength: 6,
        expiresIn: 180,
        allowedAttempts: 3,
        requireVerification: true,
        phoneNumberValidator: isKoreanMobileE164,
        sendOTP: async (data) => {
          try {
            await config.sendOTP(data);
          } catch {
            throw new APIError("BAD_GATEWAY", {
              message:
                "인증문자 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
            });
          }
        },
        signUpOnVerification: {
          // Better Auth requires an email field; this address is never used for delivery.
          getTempEmail: (phone) =>
            `${createHmac("sha256", config.secret).update(phone).digest("hex")}@phone.amor.invalid`,
          getTempName: () => "AMOR 회원",
        },
      }),
    ],
  });
}
