import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { AdSpendReport } from "@/lib/types";

export interface ListAdSpendArgs {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  platform?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export async function listAdSpend(args: ListAdSpendArgs): Promise<{
  items: AdSpendReport[];
  total: number;
}> {
  const page = args.page ?? 1;
  const pageSize = args.pageSize ?? 50;
  if (isDemoMode) {
    const store = getDemoStore();
    let items = [...store.adSpend];
    if (args.from) items = items.filter((a) => a.report_date >= args.from!);
    if (args.to) items = items.filter((a) => a.report_date <= args.to!);
    if (args.platform) items = items.filter((a) => a.platform === args.platform);
    if (args.utm_campaign) items = items.filter((a) => a.utm_campaign === args.utm_campaign);
    if (args.utm_content) items = items.filter((a) => a.utm_content === args.utm_content);
    if (args.utm_term) items = items.filter((a) => a.utm_term === args.utm_term);
    items.sort((a, b) => b.report_date.localeCompare(a.report_date));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total };
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return { items: [], total: 0 };
  let query = supabase
    .from("ad_spend_reports")
    .select("*", { count: "exact" })
    .order("report_date", { ascending: false });
  if (args.from) query = query.gte("report_date", args.from);
  if (args.to) query = query.lte("report_date", args.to);
  if (args.platform) query = query.eq("platform", args.platform);
  if (args.utm_campaign) query = query.eq("utm_campaign", args.utm_campaign);
  if (args.utm_content) query = query.eq("utm_content", args.utm_content);
  if (args.utm_term) query = query.eq("utm_term", args.utm_term);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  return {
    items: (data ?? []) as AdSpendReport[],
    total: count ?? (data?.length ?? 0),
  };
}

export interface CreateAdSpendArgs {
  report_date: string;
  platform?: string;
  campaign_name: string;
  adset_name?: string | null;
  ad_name?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  spend: number;
  impressions?: number;
  link_clicks?: number;
  landing_page_views?: number;
  notes?: string | null;
}

export async function createAdSpend(args: CreateAdSpendArgs): Promise<AdSpendReport> {
  if (isDemoMode) {
    const store = getDemoStore();
    const now = new Date().toISOString();
    const report: AdSpendReport = {
      id: randomUUID(),
      report_date: args.report_date,
      platform: args.platform ?? "meta",
      campaign_name: args.campaign_name,
      adset_name: args.adset_name ?? null,
      ad_name: args.ad_name ?? null,
      utm_campaign: args.utm_campaign ?? null,
      utm_content: args.utm_content ?? null,
      utm_term: args.utm_term ?? null,
      spend: args.spend,
      impressions: args.impressions ?? 0,
      link_clicks: args.link_clicks ?? 0,
      landing_page_views: args.landing_page_views ?? 0,
      notes: args.notes ?? null,
      created_at: now,
      updated_at: now,
    };
    store.adSpend.push(report);
    return report;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("ad_spend_reports")
    .insert({
      report_date: args.report_date,
      platform: args.platform ?? "meta",
      campaign_name: args.campaign_name,
      adset_name: args.adset_name,
      ad_name: args.ad_name,
      utm_campaign: args.utm_campaign,
      utm_content: args.utm_content,
      utm_term: args.utm_term,
      spend: args.spend,
      impressions: args.impressions ?? 0,
      link_clicks: args.link_clicks ?? 0,
      landing_page_views: args.landing_page_views ?? 0,
      notes: args.notes,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as AdSpendReport;
}

export interface SyncMetaAdSpendArgs {
  since: string;
  until: string;
  rows: {
    report_date: string;
    campaign_name: string;
    adset_name: string | null;
    ad_name: string | null;
    spend: number;
    impressions: number;
    link_clicks: number;
    landing_page_views: number;
  }[];
}

export async function syncMetaAdSpend(args: SyncMetaAdSpendArgs): Promise<number> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");

  // Delete existing meta records for the date range before re-inserting
  const { error: delError } = await supabase
    .from("ad_spend_reports")
    .delete()
    .eq("platform", "meta")
    .gte("report_date", args.since)
    .lte("report_date", args.until);
  if (delError) throw delError;

  if (args.rows.length === 0) return 0;

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from("ad_spend_reports").insert(
    args.rows.map((r) => ({
      report_date: r.report_date,
      platform: "meta",
      campaign_name: r.campaign_name,
      adset_name: r.adset_name,
      ad_name: r.ad_name,
      spend: r.spend,
      impressions: r.impressions,
      link_clicks: r.link_clicks,
      landing_page_views: r.landing_page_views,
      updated_at: now,
    })),
  );
  if (insertError) throw insertError;

  return args.rows.length;
}
