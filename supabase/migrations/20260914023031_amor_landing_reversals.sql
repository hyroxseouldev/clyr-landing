-- A durable tombstone fences late/duplicate grant delivery after a reversal.
alter table public.amor_landing_grants add column revoked_at timestamptz;
alter table public.amor_landing_grants add column removed_seconds double precision;
create or replace function private.claim_amor_landing_grants(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_phone text;
  v_grant public.amor_landing_grants%rowtype;
  v_start timestamptz;
  v_end timestamptz;
  v_cohort uuid;
  v_existing public.program_entitlements%rowtype;
  v_entitlement uuid;
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
    where phone = v_phone and claimed_user_id is null and revoked_at is null order by created_at, order_id for update
  loop
    select * into v_existing from public.program_entitlements e
      where e.tenant_id=v_grant.tenant_id and e.user_id=p_user_id
        and e.program_id=v_grant.program_id and e.is_active for update;
    v_start := greatest(now(), coalesce(v_existing.ends_at,now()));
    v_end := ((v_start at time zone 'Asia/Seoul') + make_interval(months => v_grant.duration_months)) at time zone 'Asia/Seoul';
    if v_existing.id is not null and v_existing.ends_at is null then v_end := null; end if;
    select c.id into v_cohort from public.program_cohorts c
      where c.tenant_id = v_grant.tenant_id and c.program_id = v_grant.program_id and c.is_default
      order by c.created_at, c.id limit 1;
    insert into public.tenant_memberships(tenant_id,user_id,role)
      values(v_grant.tenant_id,p_user_id,'member') on conflict(tenant_id,user_id) do nothing;
    if v_existing.id is null then
      insert into public.program_entitlements(tenant_id,user_id,program_id,source_landing_order_id,starts_at,ends_at,is_active,cohort_id)
        values(v_grant.tenant_id,p_user_id,v_grant.program_id,v_grant.order_id,v_start,v_end,true,v_cohort)
        returning id into v_entitlement;
    else
      v_entitlement := v_existing.id;
      update public.program_entitlements set ends_at=v_end,
        starts_at=case when v_existing.ends_at < now() then v_start else v_existing.starts_at end
        where id=v_existing.id;
    end if;
    insert into public.user_program_states(tenant_id,user_id,active_program_id)
      values(v_grant.tenant_id,p_user_id,v_grant.program_id)
      on conflict(tenant_id,user_id) do nothing;
    update public.amor_landing_grants set entitlement_id=v_entitlement,claimed_user_id=p_user_id,claimed_at=now(),starts_at=v_start,ends_at=v_end
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
  if v_grant.revoked_at is not null then return jsonb_build_object('orderId',p_order_id,'status','revoked'); end if;
  -- Existing verified members receive access immediately. New members are claimed
  -- when verified onboarding completes. Retrying also reconciles a raced signup.
  select u.id into v_user from auth.users u
    where private.xon_verified_phone_key(u.phone)=v_phone and u.phone_confirmed_at is not null
    order by u.created_at,u.id limit 1;
  if v_user is not null then perform private.claim_amor_landing_grants(v_user); end if;
  select * into v_grant from public.amor_landing_grants where order_id=p_order_id;
  return jsonb_build_object('orderId',p_order_id,'status',case when v_grant.revoked_at is not null then 'revoked' when v_grant.claimed_user_id is null then 'waiting' else 'claimed' end,
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

create or replace function private.revoke_amor_landing_grant(p_order_id uuid,p_program_id uuid,p_phone text,p_duration_months integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_phone text := private.xon_verified_phone_key(p_phone);
  v_grant public.amor_landing_grants%rowtype;
  v_ent public.program_entitlements%rowtype;
  v_removed interval := interval '0';
  v_end timestamptz;
  v_user uuid;
begin
  if p_order_id is null or v_phone is null or v_phone !~ '^[+]8210[0-9]{8}$'
    or p_duration_months is null or p_duration_months not between 1 and 3
    or not exists(select 1 from public.programs where id=p_program_id and tenant_id='8e4f2364-ddd7-4e65-8238-6951d67b4c42')
    then raise exception 'invalid_landing_grant' using errcode='22023'; end if;
  -- Acquire the same identity lock as signup/claim before locking a grant.
  select claimed_user_id into v_user from public.amor_landing_grants where order_id=p_order_id;
  if v_user is null then
    select id into v_user from auth.users where private.xon_verified_phone_key(phone)=v_phone and phone_confirmed_at is not null order by created_at,id limit 1;
  end if;
  if v_user is not null then perform 1 from auth.users where id=v_user for update; end if;
  insert into public.amor_landing_grants(order_id,tenant_id,program_id,phone,duration_months,revoked_at,removed_seconds)
    values(p_order_id,'8e4f2364-ddd7-4e65-8238-6951d67b4c42',p_program_id,v_phone,p_duration_months,now(),0)
    on conflict(order_id) do nothing;
  select * into v_grant from public.amor_landing_grants where order_id=p_order_id for update;
  if (v_grant.program_id,v_grant.phone,v_grant.duration_months) is distinct from (p_program_id,v_phone,p_duration_months)
    then raise exception 'landing_order_conflict' using errcode='23505'; end if;
  if v_grant.revoked_at is not null then
    return jsonb_build_object('orderId',p_order_id,'status','revoked','removedSeconds',v_grant.removed_seconds);
  end if;
  if v_grant.entitlement_id is not null then
    select * into v_ent from public.program_entitlements where id=v_grant.entitlement_id for update;
    if v_ent.tenant_id <> v_grant.tenant_id or v_ent.user_id <> v_grant.claimed_user_id or v_ent.program_id <> v_grant.program_id then
      raise exception 'landing_entitlement_mismatch';
    end if;
    -- Only reclaim the unused contribution. Preserve consumed time, pre-existing
    -- access, infinite access, and all other purchases. Never subtract months
    -- from the aggregate expiry (month lengths differ).
    if v_ent.is_active and v_ent.ends_at is not null and v_grant.ends_at > now() then
      if v_ent.ends_at < v_grant.ends_at then raise exception 'landing_entitlement_changed_review_required'; end if;
      v_removed := v_grant.ends_at - greatest(v_grant.starts_at,now());
      v_end := v_ent.ends_at - v_removed;
      update public.program_entitlements set ends_at=v_end,is_active=(v_end>now()) where id=v_ent.id;
      -- Later renewals move forward by exactly the reclaimed duration, so their
      -- own remaining contribution is still correct if refunded later.
      update public.amor_landing_grants set starts_at=starts_at-v_removed,ends_at=ends_at-v_removed
        where entitlement_id=v_ent.id and order_id<>p_order_id and revoked_at is null and starts_at>=v_grant.ends_at;
    end if;
  end if;
  update public.amor_landing_grants set revoked_at=now(),removed_seconds=extract(epoch from v_removed) where order_id=p_order_id;
  return jsonb_build_object('orderId',p_order_id,'status','revoked','removedSeconds',extract(epoch from v_removed));
end;
$$;
revoke all on function private.revoke_amor_landing_grant(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function private.revoke_amor_landing_grant(uuid,uuid,text,integer) to service_role;
create or replace function public.revoke_amor_landing_grant(p_order_id uuid,p_program_id uuid,p_phone text,p_duration_months integer)
returns jsonb language sql security invoker set search_path = '' as $$
 select private.revoke_amor_landing_grant(p_order_id,p_program_id,p_phone,p_duration_months);
$$;
revoke all on function public.revoke_amor_landing_grant(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.revoke_amor_landing_grant(uuid,uuid,text,integer) to service_role;
