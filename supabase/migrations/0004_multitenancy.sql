-- Multi-tenancy migration (Opsi B: globally unique slugs)
-- Run in Supabase SQL editor or via: supabase db push

-- 1. Tenants table -------------------------------------------------------------
create table if not exists tenants (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default 'My Store',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table tenants enable row level security;

create policy "users manage own tenant"
  on tenants for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. Add tenant_id to affiliate_products ---------------------------------------
alter table affiliate_products
  add column if not exists tenant_id uuid references tenants(id) on delete cascade;

create index if not exists idx_affiliate_products_tenant_id on affiliate_products(tenant_id);

-- 3. Add tenant_id to click_events ---------------------------------------------
alter table click_events
  add column if not exists tenant_id uuid references tenants(id) on delete set null;

create index if not exists idx_click_events_tenant_id on click_events(tenant_id);

-- 4. Add tenant_id to site_settings (each user gets own settings) --------------
alter table site_settings
  add column if not exists tenant_id uuid references tenants(id) on delete cascade;

-- 5. Update RLS: affiliate_products -------------------------------------------
drop policy if exists "auth manages affiliate_products" on affiliate_products;

create policy "tenants manage own products"
  on affiliate_products for all to authenticated
  using (
    tenant_id = (select id from tenants where user_id = auth.uid())
  )
  with check (
    tenant_id = (select id from tenants where user_id = auth.uid())
  );

-- Public read stays (needed for redirect route to resolve slug)
-- "public reads active affiliate_products" policy remains unchanged

-- 6. Update RLS: click_events -------------------------------------------------
drop policy if exists "auth reads click_events" on click_events;

create policy "tenants read own click_events"
  on click_events for select to authenticated
  using (
    tenant_id = (select id from tenants where user_id = auth.uid())
  );

-- Anon can still insert (redirect tracking)
create policy "anon inserts click_events"
  on click_events for insert to anon
  with check (true);

-- 7. Update RLS: site_settings ------------------------------------------------
drop policy if exists "auth manages site_settings" on site_settings;

create policy "tenants manage own settings"
  on site_settings for all to authenticated
  using (
    tenant_id = (select id from tenants where user_id = auth.uid())
  )
  with check (
    tenant_id = (select id from tenants where user_id = auth.uid())
  );

-- 8. Auto-create tenant on user signup ----------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.tenants (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'My Store')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 9. Indexes -------------------------------------------------------------------
create index if not exists idx_tenants_user_id on tenants(user_id);
