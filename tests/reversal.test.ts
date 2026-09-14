import assert from "node:assert/strict";
import { before, after, beforeEach, it } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import type { getDb } from "../src/db";
import {
  orders,
  orderGrants,
  orderMessages,
  orderReversals,
  orderEvents,
} from "../src/db/schema";
import {
  beginReversal,
  finishReversalWith,
  validateReversal,
} from "../src/orders/reversal";
import { changeOrderStatus } from "../src/orders/confirm";
import { deliverGrantWith } from "../src/orders/grant-delivery";
import { deliverPaymentMessageWith } from "../src/orders/delivery";
let pg: PGlite;
let db: ReturnType<typeof getDb>;
const id = "30000000-0000-4000-8000-000000000001";
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
    "truncate auth_user,orders,message_templates cascade; insert into auth_user(id,name,email) values('admin','Admin','admin@example.com'); insert into message_templates(id,body,updated_by) values('payment-confirmed','{{이름}} 입금 확인','admin')",
  );
  await db
    .insert(orders)
    .values({
      id,
      buyer_name: "Test",
      buyer_phone: "01012345678",
      buyer_phone_normalized: "01012345678",
      order_payload: {
        programId: "06a42964-2aa4-4287-a724-32fb8526e2df",
        durationMonths: 1,
        totalPriceKrw: 150000,
      },
    });
});
const undo = { kind: "undo", reason: "입금 오확인" };
it("validates reasons, transfer acknowledgment and manual legacy access review", async () => {
  assert.throws(() => validateReversal({ kind: "refund", reason: "환불" }));
  assert.throws(() => validateReversal({ ...undo, reason: " " }));
  assert.throws(() => validateReversal({ ...undo, reason: "a".repeat(501) }));
  await assert.rejects(beginReversal(db, id, "admin", undo));
  await db.update(orders).set({ status: "confirmed" });
  await assert.rejects(beginReversal(db, id, "admin", undo));
  const job = await beginReversal(db, id, "admin", {
    ...undo,
    manualAccessReviewed: true,
  });
  assert.equal(job.manual_access_reviewed, true);
  assert.equal(
    await finishReversalWith(db, job.id, async () => {
      throw Error("must not call");
    }),
    "done",
  );
  assert.equal((await db.select().from(orders))[0].status, "pending");
});
it("retains durable failure, blocks delivery, and completes once after retry", async () => {
  await changeOrderStatus(db, id, "admin", "confirmed");
  const job = await beginReversal(db, id, "admin", {
    kind: "refund",
    reason: "고객 요청",
    refundTransferred: true,
  });
  assert.equal(
    await finishReversalWith(db, job.id, async () => {
      throw Error("response lost");
    }),
    "failed",
  );
  assert.equal((await db.select().from(orders))[0].status, "reversing");
  await assert.rejects(changeOrderStatus(db, id, "admin", "confirmed"));
  let calls = 0;
  await deliverGrantWith(db, id, async () => {
    calls++;
    return { status: "waiting", startsAt: null, endsAt: null };
  });
  await deliverPaymentMessageWith(db, id, async () => {
    calls++;
    return { accepted: true };
  });
  assert.equal(calls, 0);
  assert.equal(
    await finishReversalWith(db, job.id, async () => {
      calls++;
    }),
    "done",
  );
  assert.equal(
    await finishReversalWith(db, job.id, async () => {
      calls++;
    }),
    "done",
  );
  assert.equal(calls, 1);
  assert.equal((await db.select().from(orders))[0].status, "refunded");
  assert.equal(
    (await db.select().from(orderEvents)).filter((e) => e.status === "refunded")
      .length,
    1,
  );
});
it("undo followed by reconfirm uses a fresh issuance and keeps history", async () => {
  await changeOrderStatus(db, id, "admin", "confirmed");
  const old = (await db.select().from(orderGrants))[0].issuance_id;
  const job = await beginReversal(db, id, "admin", undo);
  await finishReversalWith(db, job.id, async () => {});
  await changeOrderStatus(db, id, "admin", "confirmed");
  assert.notEqual((await db.select().from(orderGrants))[0].issuance_id, old);
  assert.equal((await db.select().from(orderReversals))[0].issuance_id, old);
  assert.equal((await db.select().from(orderMessages)).length, 1);
});
it("a late grant response cannot restore a revoked issuance", async () => {
  await changeOrderStatus(db, id, "admin", "confirmed");
  await deliverGrantWith(db, id, async () => {
    const job = await beginReversal(db, id, "admin", undo);
    await finishReversalWith(db, job.id, async () => {});
    return {
      status: "claimed",
      startsAt: new Date().toISOString(),
      endsAt: null,
    };
  });
  assert.equal((await db.select().from(orderGrants))[0].status, "revoked");
  assert.equal((await db.select().from(orders))[0].status, "pending");
});
it("blocks reversal during SMS submission and deduplicates an ongoing reversal", async () => {
  await changeOrderStatus(db, id, "admin", "confirmed");
  await db.update(orderMessages).set({ status: "sending" });
  await assert.rejects(beginReversal(db, id, "admin", undo));
  await db.update(orderMessages).set({ status: "accepted" });
  const job = await beginReversal(db, id, "admin", undo);
  assert.equal((await beginReversal(db, id, "admin", undo)).id, job.id);
  await db
    .update(orderReversals)
    .set({
      status: "sending",
      lease: "old",
      updated_at: new Date(Date.now() - 240000),
    })
    .where(eq(orderReversals.id, job.id));
  assert.equal(await finishReversalWith(db, job.id, async () => {}), "done");
});
