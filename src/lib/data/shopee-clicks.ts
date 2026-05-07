import { getTenantId } from "./tenants";
import { getSupabaseServiceRole } from "@/lib/supabase/server";

export interface ShopeeClickRow {
  tag_link: string;
  campaign_key: string;
  perujuk: string;
  report_date: string;
  klik_count: number;
}

export interface ShopeeClickSummary {
  campaign_key: string;
  klikFB: number;
  klikIG: number;
  klikLainnya: number;
}

export async function upsertShopeeClicks(
  rows: ShopeeClickRow[],
): Promise<{ ok: number; error?: string }> {
  const tenantId = await getTenantId();
  if (!tenantId) return { ok: 0, error: "Not authenticated" };

  const sb = getSupabaseServiceRole();
  if (!sb) return { ok: 0, error: "Database unavailable" };

  const withTenant = rows.map((r) => ({ ...r, tenant_id: tenantId }));

  const { error } = await sb
    .from("shopee_click_reports")
    .upsert(withTenant, { onConflict: "tenant_id,tag_link,perujuk,report_date" });

  if (error) return { ok: 0, error: error.message };
  return { ok: rows.length };
}

export async function getShopeeClickSummaries(): Promise<ShopeeClickSummary[]> {
  const tenantId = await getTenantId();
  if (!tenantId) return [];

  const sb = getSupabaseServiceRole();
  if (!sb) return [];

  const { data } = await sb
    .from("shopee_click_reports")
    .select("campaign_key, perujuk, klik_count")
    .eq("tenant_id", tenantId);

  if (!data) return [];

  const map = new Map<string, ShopeeClickSummary>();
  for (const row of data) {
    const key = row.campaign_key as string;
    const prev = map.get(key) ?? { campaign_key: key, klikFB: 0, klikIG: 0, klikLainnya: 0 };
    const src = (row.perujuk as string).toLowerCase();
    const n = row.klik_count as number;
    if (src === "facebook") prev.klikFB += n;
    else if (src === "instagram") prev.klikIG += n;
    else prev.klikLainnya += n;
    map.set(key, prev);
  }

  return Array.from(map.values());
}
