/** One-time, read-only Supabase export. Runtime uses Neon exclusively. */
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { readFile } from "node:fs/promises";
import { orders } from "../src/db/schema";
async function main() {
  loadEnvConfig(process.cwd());
  const prod = process.argv.includes("--production");
  const config = prod
    ? Object.fromEntries(
        (await readFile(".env.neon-production.local", "utf8"))
          .split("\n")
          .filter((line) => /^DATABASE_URL_UNPOOLED=/.test(line))
          .map((line) => [
            line.split("=")[0],
            JSON.parse(line.slice(line.indexOf("=") + 1)),
          ]),
      )
    : process.env;
  if (
    !config.DATABASE_URL_UNPOOLED ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_TENANT_ID
  )
    throw new Error("Missing import configuration");
  const pool = new Pool({ connectionString: config.DATABASE_URL_UNPOOLED });
  try {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: "drizzle" });
    let imported = 0,
      read = 0;
    for (let offset = 0; ; offset += 500) {
      const query = new URLSearchParams({
        tenant_id: `eq.${process.env.NEXT_PUBLIC_TENANT_ID}`,
        select: "*",
        order: "created_at.asc,id.asc",
        limit: "500",
        offset: String(offset),
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/guest_orders?${query}`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        },
      );
      if (!response.ok) throw new Error("Legacy read failed");
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("Invalid legacy response");
      read += rows.length;
      await db.transaction(async (tx) => {
        for (const row of rows) {
          if (!["pending", "confirmed", "canceled"].includes(row.status))
            throw new Error("Unknown order status");
          const result = await tx
            .insert(orders)
            .values({
              id: row.id,
              buyer_name: row.buyer_name,
              buyer_phone: row.buyer_phone,
              buyer_phone_normalized: row.buyer_phone_normalized,
              status: row.status,
              order_payload: row.order_payload,
              created_at: new Date(row.created_at),
              updated_at: new Date(row.updated_at),
              confirmed_at: row.confirmed_at
                ? new Date(row.confirmed_at)
                : null,
              canceled_at: row.canceled_at ? new Date(row.canceled_at) : null,
            })
            .onConflictDoNothing()
            .returning({ id: orders.id });
          imported += result.length;
        }
      });
      if (rows.length < 500) break;
    }
    console.log({
      environment: prod ? "production" : "development",
      legacyRead: read,
      imported,
    });
  } finally {
    await pool.end();
  }
}
main().catch(() => {
  console.error(
    "Legacy import failed; details omitted to protect personal data.",
  );
  process.exitCode = 1;
});
