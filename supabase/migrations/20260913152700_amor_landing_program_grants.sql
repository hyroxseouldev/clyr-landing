-- AMOR landing purchases use the existing app entitlements, with a separate,
-- service-only queue so legacy fixed-date auto grants keep their current behavior.
create table public.amor_landing_grants (
  order_id uuid primary key,
  tenant_id uuid not null references public.tenants(id),
  program_id uuid not null references public.programs(id),
  phone text not null check (phone ~ '^[+]8210[0-9]{8}$'),
  duration_months integer not null check (duration_months between 1 and 3),
  claimed_user_id uuid references auth.users(id) on delete restrict,
  claimed_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (tenant_id = '8e4f2364-ddd7-4e65-8238-6951d67b4c42'::uuid)
);
alter table public.amor_landing_grants enable row level security;
revoke all on public.amor_landing_grants from public, anon, authenticated;
grant select, insert, update on public.amor_landing_grants to service_role;
create index amor_landing_grants_pending_phone_idx on public.amor_landing_grants(phone) where claimed_user_id is null;
create index amor_landing_grants_program_idx on public.amor_landing_grants(program_id);
create index amor_landing_grants_claimed_user_idx on public.amor_landing_grants(claimed_user_id);

alter table public.program_entitlements add column source_landing_order_id uuid unique references public.amor_landing_grants(order_id) on delete restrict;
alter table public.program_entitlements drop constraint program_entitlements_source_check;
alter table public.program_entitlements add constraint program_entitlements_source_check check (
  num_nonnulls(source_order_id, source_invitation_id, source_granted_by, source_landing_order_id) = 1
);

create or replace function private.claim_amor_landing_grants(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_phone text;
  v_grant public.amor_landing_grants%rowtype;
  v_start timestamptz;
  v_end timestamptz;
  v_cohort uuid;
begin
  -- Called only by protected server functions or database triggers.
  -- Lock the verified identity; profile text/user_metadata never authorizes a claim.
  select private.xon_verified_phone_key(u.phone) into v_phone
  from auth.users u where u.id = p_user_id and u.phone_confirmed_at is not null
  for update;
  if v_phone is null or v_phone !~ '^[+]8210[0-9]{8}$' then return; end if;
  if not exists (select 1 from public.tenant_user_profiles p
    where p.user_id = p_user_id and p.tenant_id = '8e4f2364-ddd7-4e65-8238-6951d67b4c42'
      and p.tenant_status = 'active' and p.onboarding_completed
      and private.xon_verified_phone_key(p.phone_number) = v_phone) then return; end if;

  for v_grant in select * from public.amor_landing_grants
    where phone = v_phone and claimed_user_id is null order by created_at, order_id for update
  loop
    -- Renewals queue after an existing finite entitlement instead of wasting paid time.
    select greatest(now(), coalesce(max(e.ends_at), now())) into v_start
    from public.program_entitlements e where e.tenant_id = v_grant.tenant_id
      and e.user_id = p_user_id and e.program_id = v_grant.program_id and e.is_active;
    v_end := ((v_start at time zone 'Asia/Seoul') + make_interval(months => v_grant.duration_months)) at time zone 'Asia/Seoul';
    select c.id into v_cohort from public.program_cohorts c
      where c.tenant_id = v_grant.tenant_id and c.program_id = v_grant.program_id and c.is_default
      order by c.created_at, c.id limit 1;
    insert into public.tenant_memberships(tenant_id,user_id,role)
      values(v_grant.tenant_id,p_user_id,'member') on conflict(tenant_id,user_id) do nothing;
    insert into public.program_entitlements(tenant_id,user_id,program_id,source_landing_order_id,starts_at,ends_at,is_active,cohort_id)
      values(v_grant.tenant_id,p_user_id,v_grant.program_id,v_grant.order_id,v_start,v_end,true,v_cohort);
    insert into public.user_program_states(tenant_id,user_id,active_program_id)
      values(v_grant.tenant_id,p_user_id,v_grant.program_id)
      on conflict(tenant_id,user_id) do nothing;
    update public.amor_landing_grants set claimed_user_id=p_user_id,claimed_at=now(),starts_at=v_start,ends_at=v_end
      where order_id=v_grant.order_id;
  end loop;
end;
$$;
revoke all on function private.claim_amor_landing_grants(uuid) from public,anon,authenticated;

create or replace function private.upsert_amor_landing_grant(p_order_id uuid,p_program_id uuid,p_phone text,p_duration_months integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_phone text := private.xon_verified_phone_key(p_phone); v_grant public.amor_landing_grants%rowtype; v_user uuid;
begin
  if p_order_id is null or v_phone is null or v_phone !~ '^[+]8210[0-9]{8}$'
    or p_duration_months is null or p_duration_months not between 1 and 3
    or not exists(select 1 from public.programs where id=p_program_id and tenant_id='8e4f2364-ddd7-4e65-8238-6951d67b4c42')
    then raise exception 'invalid_landing_grant' using errcode='22023'; end if;
  insert into public.amor_landing_grants(order_id,tenant_id,program_id,phone,duration_months)
    values(p_order_id,'8e4f2364-ddd7-4e65-8238-6951d67b4c42',p_program_id,v_phone,p_duration_months)
    on conflict(order_id) do nothing;
  select * into v_grant from public.amor_landing_grants where order_id=p_order_id;
  if (v_grant.program_id,v_grant.phone,v_grant.duration_months) is distinct from (p_program_id,v_phone,p_duration_months)
    then raise exception 'landing_order_conflict' using errcode='23505'; end if;
  -- Existing verified members receive access immediately. New members are claimed
  -- when verified onboarding completes. Retrying also reconciles a raced signup.
  select u.id into v_user from auth.users u
    where private.xon_verified_phone_key(u.phone)=v_phone and u.phone_confirmed_at is not null
    order by u.created_at,u.id limit 1;
  if v_user is not null then perform private.claim_amor_landing_grants(v_user); end if;
  select * into v_grant from public.amor_landing_grants where order_id=p_order_id;
  return jsonb_build_object('orderId',p_order_id,'status',case when v_grant.claimed_user_id is null then 'waiting' else 'claimed' end,
    'startsAt',v_grant.starts_at,'endsAt',v_grant.ends_at);
end;
$$;
revoke all on function private.upsert_amor_landing_grant(uuid,uuid,text,integer) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.upsert_amor_landing_grant(uuid,uuid,text,integer) to service_role;
create or replace function public.upsert_amor_landing_grant(p_order_id uuid,p_program_id uuid,p_phone text,p_duration_months integer)
returns jsonb language sql security invoker set search_path = '' as $$
 select private.upsert_amor_landing_grant(p_order_id,p_program_id,p_phone,p_duration_months);
$$;
revoke all on function public.upsert_amor_landing_grant(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.upsert_amor_landing_grant(uuid,uuid,text,integer) to service_role;

create or replace function private.claim_amor_landing_grants_on_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.tenant_id='8e4f2364-ddd7-4e65-8238-6951d67b4c42' then
   perform private.claim_amor_landing_grants(new.user_id);
 end if;
 return new;
end;
$$;
revoke all on function private.claim_amor_landing_grants_on_profile() from public,anon,authenticated;
create trigger claim_amor_landing_grants_on_profile after insert or update of phone_number,onboarding_completed on public.tenant_user_profiles
 for each row execute function private.claim_amor_landing_grants_on_profile();

create or replace function private.claim_amor_landing_grants_on_phone()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.phone_confirmed_at is not null then perform private.claim_amor_landing_grants(new.id); end if;
 return new;
end;
$$;
revoke all on function private.claim_amor_landing_grants_on_phone() from public,anon,authenticated;
create trigger claim_amor_landing_grants_on_phone after update of phone,phone_confirmed_at on auth.users
 for each row execute function private.claim_amor_landing_grants_on_phone();
