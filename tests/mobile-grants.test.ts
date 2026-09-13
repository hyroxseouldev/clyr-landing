import assert from "node:assert/strict";
import { before, after, beforeEach, it } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const tenant = "8e4f2364-ddd7-4e65-8238-6951d67b4c42";
const program = "06a42964-2aa4-4287-a724-32fb8526e2df";
const uid = "10000000-0000-4000-8000-000000000001";
const order = "20000000-0000-4000-8000-000000000001";
let pg: PGlite;
before(async () => {
  pg = new PGlite();
  await pg.exec(`
 create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create schema private;
 create table auth.users(id uuid primary key,phone text,phone_confirmed_at timestamptz,created_at timestamptz default now());
 create table public.tenants(id uuid primary key);
 create table public.programs(id uuid primary key,tenant_id uuid);
 create table public.tenant_user_profiles(tenant_id uuid,user_id uuid,phone_number text,onboarding_completed boolean default false,tenant_status text default 'active');
 create table public.tenant_memberships(tenant_id uuid,user_id uuid,role text,primary key(tenant_id,user_id));
 create table public.program_cohorts(id uuid,tenant_id uuid,program_id uuid,is_default boolean,created_at timestamptz);
 create table public.program_entitlements(id uuid primary key default gen_random_uuid(),tenant_id uuid,user_id uuid,program_id uuid,source_order_id uuid,source_invitation_id uuid,source_granted_by uuid,starts_at timestamptz,ends_at timestamptz,is_active boolean,cohort_id uuid,
 constraint program_entitlements_source_check check(num_nonnulls(source_order_id,source_invitation_id,source_granted_by)=1));
 create unique index uq_program_entitlements_active on program_entitlements(tenant_id,user_id,program_id) where is_active=true;
 create table public.user_program_states(tenant_id uuid,user_id uuid,active_program_id uuid,primary key(tenant_id,user_id));
 create function private.xon_verified_phone_key(p_phone text) returns text language sql immutable as $$
 select case when p_phone ~ '^010[0-9]{8}$' then '+82'||substr(p_phone,2) when p_phone ~ '^[+]?8210[0-9]{8}$' then '+'||ltrim(p_phone,'+') else null end;
 $$;
 insert into public.tenants values('${tenant}');
 insert into public.programs values('${program}','${tenant}');
 `);
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.includes("amor_landing_"))
    .sort())
    await pg.exec(await readFile("supabase/migrations/" + file, "utf8"));
});
after(async () => {
  await pg.close();
});
beforeEach(async () => {
  await pg.exec(
    "truncate auth.users,tenant_user_profiles,tenant_memberships,program_entitlements,amor_landing_grants,user_program_states cascade",
  );
});
async function ingest(id = order, months = 1) {
  return (
    await pg.query<{ result: { status: string } }>(
      "select public.upsert_amor_landing_grant($1,$2,$3,$4) result",
      [id, program, "01012345678", months],
    )
  ).rows[0].result;
}
async function member(verified = false) {
  await pg.query(
    "insert into auth.users(id,phone,phone_confirmed_at) values($1,$2,$3)",
    [uid, "+821012345678", verified ? new Date() : null],
  );
  await pg.query(
    "insert into tenant_user_profiles(tenant_id,user_id,phone_number,onboarding_completed) values($1,$2,$3,true)",
    [tenant, uid, "01012345678"],
  );
}
it("keeps an unregistered purchase pending and rejects conflicting retries", async () => {
  assert.equal((await ingest()).status, "waiting");
  assert.equal((await ingest()).status, "waiting");
  assert.equal(
    (await pg.query("select * from amor_landing_grants")).rows.length,
    1,
  );
  await assert.rejects(ingest(order, 2), /landing_order_conflict/);
});
it("profile phone alone cannot claim; auth phone confirmation activates once", async () => {
  await ingest();
  await member();
  assert.equal(
    (await pg.query("select * from program_entitlements")).rows.length,
    0,
  );
  await pg.query("update auth.users set phone_confirmed_at=now() where id=$1", [
    uid,
  ]);
  assert.equal((await ingest()).status, "claimed");
  await pg.query(
    "update tenant_user_profiles set phone_number=phone_number where user_id=$1",
    [uid],
  );
  const rows = (
    await pg.query<{ starts_at: Date; ends_at: Date }>(
      "select * from program_entitlements",
    )
  ).rows;
  assert.equal(rows.length, 1);
  assert.ok(
    new Date(rows[0].ends_at).getTime() -
      new Date(rows[0].starts_at).getTime() >
      27 * 86400000,
  );
});
it("a verified existing member gets access on payment and renewals preserve paid time", async () => {
  await member(true);
  assert.equal((await ingest()).status, "claimed");
  await ingest("20000000-0000-4000-8000-000000000002", 2);
  const rows = (
    await pg.query<{ starts_at: Date; ends_at: Date }>(
      "select starts_at,ends_at from amor_landing_grants order by starts_at",
    )
  ).rows;
  assert.equal(
    (await pg.query("select * from program_entitlements")).rows.length,
    1,
  );
  assert.equal(rows.length, 2);
  assert.equal(
    new Date(rows[0].ends_at).getTime(),
    new Date(rows[1].starts_at).getTime(),
  );
});
it("requires the verified phone to match the active tenant profile", async () => {
  await ingest();
  await pg.query(
    "insert into auth.users(id,phone,phone_confirmed_at) values($1,$2,now())",
    [uid, "+821099999999"],
  );
  await pg.query(
    "insert into tenant_user_profiles(tenant_id,user_id,phone_number,onboarding_completed) values($1,$2,$3,true)",
    [tenant, uid, "01012345678"],
  );
  assert.equal(
    (await pg.query("select * from program_entitlements")).rows.length,
    0,
  );
});
it("anonymous and authenticated callers cannot issue grants or access the private queue", async () => {
  for (const role of ["anon", "authenticated"]) {
    await pg.exec(`set role ${role}`);
    try {
      await assert.rejects(ingest(), /permission denied/);
      await assert.rejects(
        pg.query("select * from amor_landing_grants"),
        /permission denied/,
      );
      await assert.rejects(
        pg.query("select private.claim_amor_landing_grants($1)", [uid]),
        /permission denied/,
      );
    } finally {
      await pg.exec("reset role");
    }
  }
  await pg.exec("set role service_role");
  try {
    assert.equal((await ingest()).status, "waiting");
  } finally {
    await pg.exec("reset role");
  }
});
