import { isDemoMode, env } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/data/tenants";
import type { SiteSettings } from "@/lib/types";

export async function getSettings(): Promise<SiteSettings | null> {
  if (isDemoMode) {
    return getDemoStore().settings;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const tenantId = await getTenantId();
  let query = supabase.from("site_settings").select("*").order("created_at", { ascending: true }).limit(1);
  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data } = await query.maybeSingle();
  return (data as SiteSettings | null) ?? null;
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings | null> {
  if (isDemoMode) {
    const store = getDemoStore();
    store.settings = { ...store.settings, ...patch, updated_at: new Date().toISOString() };
    return store.settings;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const tenantId = await getTenantId();
  const existing = await getSettings();
  if (!existing) {
    const { data } = await supabase
      .from("site_settings")
      .insert({ ...patch, ...(tenantId ? { tenant_id: tenantId } : {}) })
      .select("*")
      .maybeSingle();
    return (data as SiteSettings | null) ?? null;
  }
  const { data } = await supabase
    .from("site_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select("*")
    .maybeSingle();
  return (data as SiteSettings | null) ?? null;
}

export async function getEffectiveSiteUrl(): Promise<string> {
  const settings = await getSettings();
  return settings?.site_url?.trim().replace(/\/$/, "") || env.siteUrl.replace(/\/$/, "");
}
