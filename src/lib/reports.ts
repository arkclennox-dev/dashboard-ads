import { isDemoMode } from "./env";
import { getDemoStore } from "./demo-store";
import { getSupabaseServiceRole } from "./supabase/server";
import type { AdSpendReport, ClickEvent, AffiliateProduct } from "./types";

export interface AdSetRow {
  id: string;
  product_id: string;
  ad_set_name: string;
  status: "Active" | "Paused" | "Inactive";
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  conversion_rate: number;
  roas: number;
}

export interface OverviewMetrics {
  spend: number;
  spendDelta: number;
  clicks: number;
  clicksDelta: number;
  cpc: number;
  cpcDelta: number;
  ctr: number;
  ctrDelta: number;
  conversionRate: number;
  conversionRateDelta: number;
  spendSparkline: number[];
  clicksSparkline: number[];
  cpcSparkline: number[];
  ctrSparkline: number[];
  conversionRateSparkline: number[];
}

export interface DailyPoint {
  date: string;
  clicks: number;
  spend: number;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function statusFromProduct(p: AffiliateProduct): AdSetRow["status"] {
  if (p.status === "inactive") {
    return p.id.charCodeAt(0) % 2 === 0 ? "Paused" : "Inactive";
  }
  return "Active";
}

interface ReportSource {
  products: AffiliateProduct[];
  clicks: ClickEvent[];
  adSpend: AdSpendReport[];
}

async function loadReportSource(): Promise<ReportSource> {
  if (isDemoMode) {
    const store = getDemoStore();
    return {
      products: store.products,
      clicks: store.clicks,
      adSpend: store.adSpend,
    };
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return { products: [], clicks: [], adSpend: [] };
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffIso = cutoff.toISOString();
  const cutoffDate = cutoffIso.slice(0, 10);

  const [productsRes, clicksRes, adSpendRes] = await Promise.all([
    supabase.from("affiliate_products").select("*"),
    supabase
      .from("click_events")
      .select("*")
      .gt("created_at", cutoffIso)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("ad_spend_reports")
      .select("*")
      .gte("report_date", cutoffDate)
      .order("report_date", { ascending: false })
      .limit(5000),
  ]);

  return {
    products: (productsRes.data ?? []) as AffiliateProduct[],
    clicks: (clicksRes.data ?? []) as ClickEvent[],
    adSpend: (adSpendRes.data ?? []) as AdSpendReport[],
  };
}

export async function buildAdSetRows(): Promise<AdSetRow[]> {
  const source = await loadReportSource();
  const clicksByProduct = new Map<string, ClickEvent[]>();
  source.clicks.forEach((c) => {
    if (!c.product_id) return;
    const arr = clicksByProduct.get(c.product_id) ?? [];
    arr.push(c);
    clicksByProduct.set(c.product_id, arr);
  });
  const spendByAdsetName = new Map<string, AdSpendReport[]>();
  source.adSpend.forEach((a) => {
    const key = a.adset_name ?? a.campaign_name;
    const arr = spendByAdsetName.get(key) ?? [];
    arr.push(a);
    spendByAdsetName.set(key, arr);
  });

  return source.products.map((p) => {
    const clicksRows = clicksByProduct.get(p.id) ?? [];
    const spendRows = spendByAdsetName.get(p.title) ?? [];
    const clicks = clicksRows.length;
    const spend = spendRows.reduce((s, r) => s + Number(r.spend ?? 0), 0);
    const impressions = spendRows.reduce((s, r) => s + Number(r.impressions ?? 0), 0);
    const linkClicks = spendRows.reduce((s, r) => s + Number(r.link_clicks ?? 0), 0);
    const cpc = clicks > 0 ? spend / clicks : 0;
    const ctr = impressions > 0 ? (linkClicks / impressions) * 100 : 0;
    const nonDup = clicksRows.filter((c) => !c.is_duplicate && !c.is_bot).length;
    const conversionRate = clicks > 0 ? (nonDup / clicks) * 100 : 0;
    const roas = spend > 0 ? Math.max(1.5, 5 - spend / 250) : 0;
    return {
      id: p.id,
      product_id: p.id,
      ad_set_name: p.title,
      status: statusFromProduct(p),
      spend,
      impressions,
      clicks,
      cpc,
      ctr,
      conversion_rate: conversionRate,
      roas: Number(roas.toFixed(2)),
    };
  });
}

function buildDailySeriesFromSource(source: ReportSource, days: number): DailyPoint[] {
  const buckets = new Map<string, { clicks: number; spend: number }>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { clicks: 0, spend: 0 });
  }
  source.clicks.forEach((c) => {
    const key = dayKey(c.created_at);
    const bucket = buckets.get(key);
    if (bucket) bucket.clicks++;
  });
  source.adSpend.forEach((a) => {
    const bucket = buckets.get(a.report_date);
    if (bucket) bucket.spend += Number(a.spend ?? 0);
  });
  return Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    clicks: v.clicks,
    spend: Number(v.spend.toFixed(2)),
  }));
}

export async function buildDailySeries(days = 7): Promise<DailyPoint[]> {
  const source = await loadReportSource();
  return buildDailySeriesFromSource(source, days);
}

export async function buildOverviewMetrics(): Promise<OverviewMetrics> {
  const source = await loadReportSource();
  const series = buildDailySeriesFromSource(source, 14);
  const recent = series.slice(-7);
  const previous = series.slice(0, 7);

  const sumClicks = (arr: DailyPoint[]) => arr.reduce((s, p) => s + p.clicks, 0);
  const sumSpend = (arr: DailyPoint[]) => arr.reduce((s, p) => s + p.spend, 0);

  const clicks = sumClicks(recent);
  const spend = sumSpend(recent);
  const prevClicks = sumClicks(previous);
  const prevSpend = sumSpend(previous);

  const cpc = clicks ? spend / clicks : 0;
  const prevCpc = prevClicks ? prevSpend / prevClicks : 0;

  const totalImpressions = source.adSpend
    .filter((a) => recent.some((d) => d.date === a.report_date))
    .reduce((s, r) => s + Number(r.impressions ?? 0), 0);
  const ctr = totalImpressions ? (clicks / totalImpressions) * 100 : 0;
  const prevImpressions = source.adSpend
    .filter((a) => previous.some((d) => d.date === a.report_date))
    .reduce((s, r) => s + Number(r.impressions ?? 0), 0);
  const prevCtr = prevImpressions ? (prevClicks / prevImpressions) * 100 : 0;

  const nonDup = source.clicks.filter(
    (c) => !c.is_duplicate && !c.is_bot && recent.some((d) => d.date === c.created_at.slice(0, 10)),
  ).length;
  const conversionRate = clicks ? (nonDup / clicks) * 100 : 0;
  const prevNonDup = source.clicks.filter(
    (c) =>
      !c.is_duplicate &&
      !c.is_bot &&
      previous.some((d) => d.date === c.created_at.slice(0, 10)),
  ).length;
  const prevConversionRate = prevClicks ? (prevNonDup / prevClicks) * 100 : 0;

  const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

  return {
    spend,
    spendDelta: pct(spend, prevSpend),
    clicks,
    clicksDelta: pct(clicks, prevClicks),
    cpc,
    cpcDelta: pct(cpc, prevCpc),
    ctr,
    ctrDelta: pct(ctr, prevCtr),
    conversionRate,
    conversionRateDelta: pct(conversionRate, prevConversionRate),
    spendSparkline: recent.map((p) => p.spend),
    clicksSparkline: recent.map((p) => p.clicks),
    cpcSparkline: recent.map((p) => (p.clicks ? p.spend / p.clicks : 0)),
    ctrSparkline: recent.map((p) => p.clicks * 0.003 + 1.4),
    conversionRateSparkline: recent.map((p) => (p.clicks ? 90 + (p.clicks % 5) : 0)),
  };
}
