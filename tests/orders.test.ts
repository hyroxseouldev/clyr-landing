import assert from "node:assert/strict";
import { before, beforeEach, after, describe, it } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import type { getDb } from "../src/db";
import {
  orders,
  user,
  orderMessages,
  orderGrants,
  orderEvents,
  messageTemplates,
} from "../src/db/schema";
import { buildOrder, assertMaster, verifiedPhone } from "../src/orders/policy";
import {
  DEFAULT_PAYMENT_TEMPLATE,
  renderPaymentMessage,
  validateTemplate,
} from "../src/orders/message-template";
import { changeOrderStatus } from "../src/orders/confirm";
import { deliverPaymentMessageWith } from "../src/orders/delivery";
import { validateBankAccount } from "../src/orders/bank-account";
import { deliverGrantWith } from "../src/orders/grant-delivery";
const buyer = {
  id: "buyer",
  phoneNumber: "+821012345678",
  phoneNumberVerified: true,
};
const input = {
  requestId: "00000000-0000-4000-8000-000000000001",
  buyerName: "테스트",
  buyerEmail: "test@example.com",
  programId: "06a42964-2aa4-4287-a724-32fb8526e2df",
  durationMonths: 2,
  agreement: true,
};
describe("order authorization and validation", () => {
  it("requires server-verified phone and exact master ID", () => {
    assert.throws(() => verifiedPhone(null));
    assert.throws(() =>
      verifiedPhone({ ...buyer, phoneNumberVerified: false }),
    );
    assert.throws(() =>
      assertMaster({ id: "attacker", email: "admin@amorlab.kr" }, "master"),
    );
    assert.throws(() => assertMaster({ id: "master" }, undefined));
    assertMaster({ id: "master" }, "master");
  });
  it("ignores client price, phone, payment method and user ID", () => {
    const result = buildOrder(
      {
        ...input,
        totalPriceKrw: 1,
        buyerPhone: "01099999999",
        paymentMethod: "card",
        authUserId: "other",
      },
      buyer,
    );
    assert.equal(result.order_payload.totalPriceKrw, 300000);
    assert.equal(result.buyer_phone, "01012345678");
    assert.equal(result.order_payload.paymentMethod, "bank");
    assert.equal(result.order_payload.authUserId, "buyer");
    for (const change of [
      { durationMonths: 0 },
      { durationMonths: 1.5 },
      { programId: "fake" },
      { agreement: false },
      { buyerName: "" },
    ])
      assert.throws(() => buildOrder({ ...input, ...change }, buyer));
  });
  it("renders only supported placeholders without recursive substitution", () => {
    assert.throws(() => validateTemplate("{{비밀번호}}"));
    assert.throws(() => validateTemplate("x".repeat(601)));
    const order = buildOrder(input, buyer);
    assert.match(
      renderPaymentMessage(DEFAULT_PAYMENT_TEMPLATE, order),
      /300,000원/,
    );
    assert.equal(
      renderPaymentMessage("{{이름}}", { ...order, buyer_name: "{{금액}}" }),
      "{{금액}}",
    );
  });
});
describe("payment confirmation and outbox (isolated PostgreSQL; no SMS)", () => {
  let pg: PGlite;
  let db: ReturnType<typeof getDb>;
  before(async () => {
    pg = new PGlite();
    db = drizzle(pg) as unknown as ReturnType<typeof getDb>;
    for (const file of (await readdir("drizzle"))
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await pg.exec(await readFile(`drizzle/${file}`, "utf8"));
  });
  beforeEach(async () => {
    await pg.exec(
      "TRUNCATE auth_user, orders, order_events, order_messages, message_templates CASCADE",
    );
    await db.insert(user).values([
      { id: "buyer", name: "Buyer", email: "buyer@example.com" },
      { id: "master", name: "Master", email: "master@example.com" },
    ]);
    await db.insert(orders).values({
      ...buildOrder(input, buyer),
      status: "pending",
      user_id: "buyer",
    });
  });
  after(async () => {
    await pg.close();
  });
  async function template() {
    await db.insert(messageTemplates).values({
      id: "payment-confirmed",
      body: DEFAULT_PAYMENT_TEMPLATE,
      updated_by: "master",
    });
  }
  it("rolls back payment confirmation when template is missing", async () => {
    await assert.rejects(
      changeOrderStatus(db, input.requestId, "master", "confirmed"),
    );
    assert.equal((await db.select().from(orders))[0].status, "pending");
    assert.equal((await db.select().from(orderEvents)).length, 0);
  });
  it("atomically confirms once and snapshots the saved template", async () => {
    await template();
    await changeOrderStatus(db, input.requestId, "master", "confirmed");
    await assert.rejects(
      changeOrderStatus(db, input.requestId, "master", "confirmed"),
    );
    assert.equal((await db.select().from(orderMessages)).length, 1);
    assert.equal((await db.select().from(orderGrants)).length, 1);
    assert.equal((await db.select().from(orderEvents)).length, 1);
    await db.update(messageTemplates).set({ body: "Changed" });
    let sends = 0;
    const transport = async (job: { body: string }) => {
      sends++;
      assert.match(job.body, /300,000원/);
      return { accepted: true, providerId: "fake" };
    };
    assert.equal(
      await deliverPaymentMessageWith(db, input.requestId, transport),
      "accepted",
    );
    assert.equal(
      await deliverPaymentMessageWith(db, input.requestId, transport),
      undefined,
    );
    assert.equal(sends, 1);
  });
  it("retries a lost app response without duplicate purchase and recovers stale leases", async () => {
    await template();
    await changeOrderStatus(db, input.requestId, "master", "confirmed");
    const remote = new Set<string>();
    let calls = 0;
    const status = await deliverGrantWith(db, input.requestId, async (job) => {
      remote.add(job.order_id);
      if (++calls === 1) throw new Error("lost response");
      return { status: "waiting", startsAt: null, endsAt: null };
    });
    assert.equal(status, "waiting");
    assert.equal(remote.size, 1);
    assert.equal(calls, 2);
    await db
      .update(orderGrants)
      .set({
        status: "sending",
        lease: "old",
        updated_at: new Date(Date.now() - 240000),
      });
    assert.equal(
      await deliverGrantWith(db, input.requestId, async () => ({
        status: "claimed",
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 86400000).toISOString(),
      })),
      "claimed",
    );
    await deliverGrantWith(db, input.requestId, async () => {
      throw new Error("must not call");
    });
    assert.equal((await db.select().from(orderGrants))[0].status, "claimed");
  });
  it("keeps payment confirmed and SMS pending when the app is unavailable", async () => {
    await template();
    await changeOrderStatus(db, input.requestId, "master", "confirmed");
    assert.equal(
      await deliverGrantWith(db, input.requestId, async () => {
        throw new Error("offline");
      }),
      "failed",
    );
    assert.equal((await db.select().from(orders))[0].status, "confirmed");
    assert.equal((await db.select().from(orderMessages))[0].status, "pending");
  });
  it("retains confirmed payment on rejection and permits explicit retry", async () => {
    await template();
    await changeOrderStatus(db, input.requestId, "master", "confirmed");
    assert.equal(
      await deliverPaymentMessageWith(db, input.requestId, async () => ({
        accepted: false,
      })),
      "failed",
    );
    assert.equal((await db.select().from(orders))[0].status, "confirmed");
    await deliverPaymentMessageWith(db, input.requestId, async () => ({
      accepted: true,
    }));
    assert.equal((await db.select().from(orderMessages))[0].attempts, 2);
  });
  it("does not retry ambiguous sends, and cancellation never enqueues SMS", async () => {
    await template();
    await changeOrderStatus(db, input.requestId, "master", "confirmed");
    assert.equal(
      await deliverPaymentMessageWith(db, input.requestId, async () => {
        throw new Error("timeout");
      }),
      "unknown",
    );
    assert.equal(
      await deliverPaymentMessageWith(db, input.requestId, async () => {
        throw new Error("must not run");
      }),
      undefined,
    );
    const secondId = "00000000-0000-4000-8000-000000000002";
    await db.insert(orders).values({
      ...buildOrder({ ...input, requestId: secondId }, buyer),
      status: "pending",
    });
    await changeOrderStatus(db, secondId, "master", "canceled");
    assert.equal(
      (
        await db
          .select()
          .from(orderMessages)
          .where(eq(orderMessages.order_id, secondId))
      ).length,
      0,
    );
  });
});

it("validates bank details and snapshots only server account fields", () => {
  const account = validateBankAccount({
    bankName: " 국민은행 ",
    accountNumber: "123456-78-901234",
    holderName: " 테스트 ",
  });
  assert.equal(account.bankName, "국민은행");
  for (const change of [
    { accountNumber: "abc" },
    { accountNumber: "123" },
    { holderName: "" },
    { bankName: "은행\n위조" },
  ])
    assert.throws(() => validateBankAccount({ ...account, ...change }));
  const serverAccount = {
    ...account,
    revision: "private-revision",
    updatedBy: "master",
  };
  const order = buildOrder(
    { ...input, bankAccount: { bankName: "attacker" } },
    buyer,
    serverAccount,
  );
  assert.deepEqual(order.order_payload.bankAccount, account);
  serverAccount.accountNumber = "99999999999";
  assert.equal(
    order.order_payload.bankAccount?.accountNumber,
    account.accountNumber,
  );
});
