import assert from "node:assert/strict";
import { before, beforeEach, after, it } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { getDb } from "../src/db";
import {
  orders,
  adminOrderMessages,
  orderAlertSettings,
  orderMessages,
} from "../src/db/schema";
import {
  DEFAULT_ORDER_ALERT,
  validateOrderAlert,
  enqueueAdminOrderAlert,
} from "../src/orders/admin-alert";
import { deliverOrderMessageWith } from "../src/orders/delivery";
const id = "30000000-0000-4000-8000-000000000001";
const order = {
  id,
  buyer_name: "김아모",
  buyer_phone: "01012345678",
  buyer_phone_normalized: "01012345678",
  order_payload: {
    programName: "HYROX 기초",
    durationMonths: 1,
    totalPriceKrw: 150000,
  },
};
let pg: PGlite;
let db: ReturnType<typeof getDb>;
before(async () => {
  pg = new PGlite();
  db = drizzle(pg) as unknown as ReturnType<typeof getDb>;
  for (const f of (await readdir("drizzle"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await pg.exec(await readFile("drizzle/" + f, "utf8"));
});
after(async () => {
  await pg.close();
});
beforeEach(async () => {
  await pg.exec(
    "truncate orders,admin_order_messages,order_alert_settings cascade",
  );
  await db
    .insert(orderAlertSettings)
    .values({
      id: "new-order",
      enabled: true,
      recipient: "01097224668",
      body: DEFAULT_ORDER_ALERT,
      revision: "initial",
    });
});
async function create() {
  await db.transaction(async (tx) => {
    await tx.insert(orders).values(order);
    await enqueueAdminOrderAlert(tx, order);
  });
}
it("validates the recipient, boolean setting, placeholders and rendered size", () => {
  assert.equal(
    validateOrderAlert({
      enabled: true,
      recipient: "010-9722-4668",
      body: DEFAULT_ORDER_ALERT,
    }).recipient,
    "01097224668",
  );
  for (const change of [
    { recipient: "123" },
    { enabled: "yes" },
    { body: "{{비밀}}" },
    { body: "{{프로그램}}".repeat(70) },
  ])
    assert.throws(() =>
      validateOrderAlert({
        enabled: true,
        recipient: "01097224668",
        body: DEFAULT_ORDER_ALERT,
        ...change,
      }),
    );
});
it("enqueues once, snapshots settings and keeps customer messages separate", async () => {
  await create();
  await db.transaction((tx) => enqueueAdminOrderAlert(tx, order));
  await db
    .update(orderAlertSettings)
    .set({ recipient: "01011112222", body: "Changed" });
  const jobs = await db.select().from(adminOrderMessages);
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].recipient, "01097224668");
  assert.match(jobs[0].body, /150,000원/);
  assert.match(jobs[0].body, /김아모/);
  assert.equal((await db.select().from(orderMessages)).length, 0);
});
it("disabled alerts do not enqueue and rolled-back orders cannot send", async () => {
  await db.update(orderAlertSettings).set({ enabled: false });
  await create();
  assert.equal((await db.select().from(adminOrderMessages)).length, 0);
  await db.update(orderAlertSettings).set({ enabled: true });
  await assert.rejects(
    db.transaction(async (tx) => {
      await enqueueAdminOrderAlert(tx, order);
      throw new Error("rollback");
    }),
  );
  assert.equal((await db.select().from(adminOrderMessages)).length, 0);
});
it("sends once and keeps the order when the provider rejects an alert", async () => {
  await create();
  await deliverOrderMessageWith(db, adminOrderMessages, id, async () => ({
    accepted: false,
  }));
  assert.equal((await db.select().from(orders)).length, 1);
  let sent = 0;
  const transport = async () => {
    sent++;
    return { accepted: true };
  };
  await deliverOrderMessageWith(db, adminOrderMessages, id, transport);
  await deliverOrderMessageWith(db, adminOrderMessages, id, transport);
  assert.equal(sent, 1);
});
it("does not retry an ambiguous SMS result", async () => {
  await create();
  assert.equal(
    await deliverOrderMessageWith(db, adminOrderMessages, id, async () => {
      throw new Error("timeout");
    }),
    "unknown",
  );
  assert.equal(
    await deliverOrderMessageWith(db, adminOrderMessages, id, async () => {
      throw new Error("must not send");
    }),
    undefined,
  );
});
