import assert from "node:assert/strict";
import { before, beforeEach, after, describe, it } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createAuth } from "../src/auth/config";
import { normalizeKoreanMobile, toSolapiRecipient } from "../src/auth/phone";
import { createOtpSender } from "../src/sms/send-otp";
import * as schema from "../src/db/schema";

describe("phone/SOLAPI boundaries", () => {
  it("normalizes domestic and E.164 representations without accepting foreign or malformed numbers", () => {
    for (const value of ["010-1234-5678", "010 1234 5678", "+82 10 1234 5678"])
      assert.equal(normalizeKoreanMobile(value), "+821012345678");
    assert.equal(toSolapiRecipient("+821012345678"), "01012345678");
    for (const value of [
      "+12025550123",
      "0101234567",
      "phone01012345678",
      "++821012345678",
      "821012345678",
    ])
      assert.throws(() => normalizeKoreanMobile(value));
  });
  it("sends a domestic SMS and treats provider rejection as failure without leaking the provider error", async () => {
    const send = createOtpSender("0212345678", async (message) => {
      assert.equal(message.to, "01012345678");
      assert.equal(message.type, "SMS");
      assert.match(message.text, /123456/);
      return { failedMessageList: [] };
    });
    await send({ phoneNumber: "+821012345678", code: "123456" });
    const reject = createOtpSender("0212345678", async () => ({
      failedMessageList: [{ secret: "private-provider-details" }],
    }));
    await assert.rejects(
      reject({ phoneNumber: "+821012345678", code: "123456" }),
      (error) =>
        error instanceof Error &&
        !error.message.includes("private-provider-details"),
    );
  });
});

describe("Better Auth + Drizzle integration (isolated PostgreSQL, no network or paid SMS)", () => {
  let postgres: PGlite;
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let auth: ReturnType<typeof createAuth>;
  let code: string;
  const phoneNumber = "+821012345678";
  const baseURL = "http://localhost:3000";
  function makeAuth(
    sendOTP = async (data: { code: string }) => {
      code = data.code;
    },
  ) {
    return createAuth({
      database: drizzleAdapter(db, {
        provider: "pg",
        schema,
        transaction: true,
      }),
      baseURL,
      secret: "test-only-secret-6ce2dbf692cf455dacf2fef82419c6dd",
      sendOTP,
    });
  }
  function request(path: string, body?: object, cookie?: string) {
    return auth.handler(
      new Request(`${baseURL}/api/auth${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: baseURL,
          "x-forwarded-for": "198.51.100.20",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    );
  }
  before(async () => {
    postgres = new PGlite();
    db = drizzle(postgres, { schema });
    for (const name of (await readdir("drizzle"))
      .filter((name) => name.endsWith(".sql"))
      .sort()) {
      await postgres.exec(await readFile(`drizzle/${name}`, "utf8"));
    }
  });
  beforeEach(async () => {
    await postgres.exec(
      "TRUNCATE auth_user, auth_session, auth_account, auth_verification, auth_rate_limit CASCADE",
    );
    code = "";
    auth = makeAuth();
  });
  after(async () => {
    await postgres.close();
  });

  it("rejects unnormalized/foreign phone numbers before requesting SMS", async () => {
    const response = await request("/phone-number/send-otp", {
      phoneNumber: "01012345678",
    });
    assert.equal(response.status, 400);
    assert.equal(code, "");
  });
  it("verifies an OTP, creates a verified user and cookie session, and prevents replay", async () => {
    assert.equal(
      (await request("/phone-number/send-otp", { phoneNumber })).status,
      200,
    );
    assert.match(code, /^\d{6}$/);
    const response = await request("/phone-number/verify", {
      phoneNumber,
      code,
    });
    assert.equal(response.status, 200, await response.clone().text());
    const users = await db.select().from(schema.user);
    assert.equal(users.length, 1);
    assert.equal(users[0].phoneNumber, phoneNumber);
    assert.equal(users[0].phoneNumberVerified, true);
    assert.equal(users[0].email.includes("1012345678"), false);
    const cookie = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    assert.ok(cookie.includes("session_token"));
    const session = await (
      await request("/get-session", undefined, cookie)
    ).json();
    assert.equal(session.user.id, users[0].id);
    assert.equal(
      (await request("/phone-number/verify", { phoneNumber, code })).status,
      400,
    );
  });
  it("locks the OTP after three wrong attempts", async () => {
    await request("/phone-number/send-otp", { phoneNumber });
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 3; i++)
      assert.ok(
        (await request("/phone-number/verify", { phoneNumber, code: wrong }))
          .status >= 400,
      );
    assert.ok(
      (await request("/phone-number/verify", { phoneNumber, code })).status >=
        400,
    );
    assert.equal((await db.select().from(schema.session)).length, 0);
  });
  it("rejects expired OTPs", async () => {
    await request("/phone-number/send-otp", { phoneNumber });
    await db
      .update(schema.verification)
      .set({ expiresAt: new Date(Date.now() - 1_000) });
    assert.equal(
      (await request("/phone-number/verify", { phoneNumber, code })).status,
      400,
    );
  });
  it("persists send throttling across auth instances", async () => {
    assert.equal(
      (await request("/phone-number/send-otp", { phoneNumber })).status,
      200,
    );
    auth = makeAuth();
    assert.equal(
      (await request("/phone-number/send-otp", { phoneNumber })).status,
      429,
    );
    assert.ok((await db.select().from(schema.rateLimit)).length > 0);
  });
  it("fails closed when SMS delivery is rejected", async () => {
    auth = makeAuth(async () => {
      throw new Error("secret provider response");
    });
    const response = await request("/phone-number/send-otp", { phoneNumber });
    assert.equal(response.status, 502);
    assert.equal(
      (await response.text()).includes("secret provider response"),
      false,
    );
    assert.equal((await db.select().from(schema.user)).length, 0);
  });
  it("blocks untrusted origins and password endpoints", async () => {
    const response = await auth.handler(
      new Request(`${baseURL}/api/auth/phone-number/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://untrusted.example",
        },
        body: JSON.stringify({ phoneNumber }),
      }),
    );
    assert.equal(response.status, 403);
    assert.equal(
      (
        await request("/sign-in/phone-number", {
          phoneNumber,
          password: "not-enabled",
        })
      ).status,
      404,
    );
  });
});
