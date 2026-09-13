import "server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { createSolapiSender } from "@/sms/solapi";
import { createAuth } from "./config";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} is required to enable phone authentication`);
  return value;
}

let auth: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (process.env.AUTH_ENABLED !== "true")
    throw new Error("Phone authentication is not enabled");
  if (auth) return auth;
  const secret = required("BETTER_AUTH_SECRET");
  if (secret.length < 32)
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters");
  const baseURL = required("BETTER_AUTH_URL");
  const url = new URL(baseURL);
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error("BETTER_AUTH_URL must be an origin URL");
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new Error("BETTER_AUTH_URL must use HTTPS outside localhost");
  const sendOTP = createSolapiSender({
    apiKey: required("SOLAPI_API_KEY"),
    apiSecret: required("SOLAPI_API_SECRET"),
    senderNumber: required("SOLAPI_SENDER_NUMBER"),
  });
  auth = createAuth({
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema,
      transaction: true,
    }),
    secret,
    baseURL,
    sendOTP,
  });
  return auth;
}
