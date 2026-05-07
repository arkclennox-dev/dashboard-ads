create table if not exists shopee_click_reports (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  tag_link text not null,
  campaign_key text not null,
  perujuk text not null,
  report_date date not null,
  klik_count integer not null default 0,
  created_at timestamptz default now(),
  unique(tenant_id, tag_link, perujuk, report_date)
);

alter table shopee_click_reports enable row level security;

create policy "tenant_shopee_clicks" on shopee_click_reports
  for all using (
    tenant_id = (
      select id from tenants where user_id = auth.uid() limit 1
    )
  );

create index if not exists idx_shopee_clicks_tenant_campaign
  on shopee_click_reports(tenant_id, campaign_key);
