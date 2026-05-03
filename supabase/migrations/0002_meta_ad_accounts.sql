-- Meta Ad Accounts — store multiple Meta ad accounts with individual tokens

create table if not exists meta_ad_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ad_account_id text not null unique,
  access_token text not null,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ad_spend_reports
  add column if not exists meta_account_id text;

create index if not exists idx_meta_ad_accounts_ad_account_id on meta_ad_accounts(ad_account_id);
create index if not exists idx_ad_spend_reports_meta_account_id on ad_spend_reports(meta_account_id);

alter table meta_ad_accounts enable row level security;
create policy "auth manages meta_ad_accounts"
  on meta_ad_accounts for all to authenticated using (true) with check (true);
