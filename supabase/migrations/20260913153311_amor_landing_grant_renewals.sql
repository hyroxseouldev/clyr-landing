-- Keep the existing single-active-entitlement invariant on app renewals.
alter table public.amor_landing_grants add column entitlement_id uuid references public.program_entitlements(id) on delete restrict;
create index amor_landing_grants_entitlement_idx on public.amor_landing_grants(entitlement_id);
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
    where phone = v_phone and claimed_user_id is null order by created_at, order_id for update
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

