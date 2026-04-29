-- Commission reports (Shopee affiliate income) -----------------------------------
create table if not exists commission_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  klik int not null default 0,
  pesanan int not null default 0,
  komisi numeric(14,2) not null default 0,
  pembelian numeric(14,2) not null default 0,
  produk_terjual int not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_commission_reports_report_date on commission_reports(report_date);

alter table commission_reports enable row level security;

create policy "auth manages commission_reports"
  on commission_reports for all to authenticated using (true) with check (true);

-- short_code column for affiliate_products (root-level /{code} redirects) ------
alter table affiliate_products
  add column if not exists short_code text unique;
