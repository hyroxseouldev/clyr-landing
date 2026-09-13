/** Credentials come from the process environment and are never written to source. */
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { readFile, writeFile } from "node:fs/promises";
import { user, account } from "../src/db/schema";
async function main() {
  loadEnvConfig(process.cwd());
  const email = process.env.MASTER_EMAIL?.trim().toLowerCase();
  const password = process.env.MASTER_PASSWORD;
  if (!email || !password || password.length < 10)
    throw new Error("Missing master credentials");
  const prod = process.argv.includes("--production");
  const file = prod ? ".env.neon-production.local" : ".env.local";
  let content = await readFile(file, "utf8");
  const match = content.match(/^DATABASE_URL_UNPOOLED=(.*)$/m);
  if (!match) throw new Error("Missing database URL");
  const pool = new Pool({ connectionString: JSON.parse(match[1]) });
  try {
    const db = drizzle(pool);
    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing.length)
      throw new Error(
        "Account already exists; automatic credential replacement is disabled",
      );
    const id = crypto.randomUUID();
    const hash = await hashPassword(password);
    await db.transaction(async (tx) => {
      await tx
        .insert(user)
        .values({ id, email, name: "AMOR LAB 관리자", emailVerified: true });
      await tx
        .insert(account)
        .values({
          id: crypto.randomUUID(),
          userId: id,
          accountId: id,
          providerId: "credential",
          password: hash,
        });
    });
    content =
      content.replace(/^ADMIN_USER_ID=.*\n?/gm, "") + `ADMIN_USER_ID=${id}\n`;
    await writeFile(file, content, { mode: 0o600 });
    console.log({
      environment: prod ? "production" : "development",
      masterCreated: true,
      passwordStoredAsHash: true,
    });
  } finally {
    await pool.end();
  }
}
main().catch(() => {
  console.error("Master provisioning failed; credentials omitted.");
  process.exitCode = 1;
});
