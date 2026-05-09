-- Add section-based builder columns to landing_pages
alter table landing_pages
  add column if not exists sections jsonb not null default '[]',
  add column if not exists page_settings jsonb not null default '{}';

-- Update public URL hint in comments (pages now at /lp/[slug])
comment on table landing_pages is 'Builder-based landing pages, rendered at /lp/[slug]';
