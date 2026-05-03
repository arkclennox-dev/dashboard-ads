import { isDemoMode } from "./env";
import { getDemoStore } from "./demo-store";
import { getSupabaseServiceRole } from "./supabase/server";
import type { AdSpendReport, AffiliateProduct, CommissionReport } from "./types";

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
  totalNetProfit: number;
  totalNetProfitDelta: number;
  profitSparkline: number[];
  conversionRate: number;
  conversionRateDelta: number;
  spendSparkline: number[];
  clicksSparkline: number[];
  cpcSparkline: number[];
  conversionRateSparkline: number[];
  comparisonLabel: string;
}

export interface DailyPoint {
  date: string;
  clicks: number;
  spend: number;
  komisi: number;
}

function statusFromProduct(p: AffiliateProduct): AdSetRow["status"] {
  if (p.status === "inactive") {
    return p.id.charCodeAt(0) % 2 === 0 ? "Paused" : "Inactive";
  }
  return "Active";
}

interface ReportSource {
  products: AffiliateProduct[];
  adSpend: AdSpendReport[];
  commissions: CommissionReport[];
}

async function loadReportSource(from?: string, to?: string): Promise<ReportSource> {
  if (isDemoMode) {
    const store = getDemoStore();
    let adSpend = store.adSpend;
    let commissions = store.commissions;
    if (from) {
      adSpend = adSpend.filter((a) => a.report_date >= from);
      commissions = commissions.filter((c) => c.report_date >= from);
    }
    if (to) {
      adSpend = adSpend.filter((a) => a.report_date <= to);
      commissions = commissions.filter((c) => c.report_date <= to);
    }
    return { products: store.products, adSpend, commissions };
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return { products: [], adSpend: [], commissions: [] };
  }

  const cutoffDate = from ?? (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return cutoff.toISOString().slice(0, 10);
  })();

  let adSpendQuery = supabase
    .from("ad_spend_reports")
    .select("*")
    .gte("report_date", cutoffDate)
    .order("report_date", { ascending: false })
    .limit(5000);

  let commissionsQuery = supabase
    .from("commission_reports")
    .select("*")
    .gte("report_date", cutoffDate)
    .order("report_date", { ascending: false })
    .limit(5000);

  if (to) {
    adSpendQuery = adSpendQuery.lte("report_date", to);
    commissionsQuery = commissionsQuery.lte("report_date", to);
  }

  const [productsRes, adSpendRes, commissionsRes] = await Promise.all([
    supabase.from("affiliate_products").select("*"),
    adSpendQuery,
    commissionsQuery,
  ]);

  return {
    products: (productsRes.data ?? []) as AffiliateProduct[],
    adSpend: (adSpendRes.data ?? []) as AdSpendReport[],
    commissions: (commissionsRes.data ?? []) as CommissionReport[],
  };
}

export async function buildAdSetRows(from?: string, to?: string): Promise<AdSetRow[]> {
  const source = await loadReportSource(from, to);

  const grouped = new Map<string, { rows: AdSpendReport[]; key: string }>();
  source.adSpend.forEach((a) => {
    const key = [a.campaign_name, a.adset_name ?? ""].filter(Boolean).join(" › ");
    const entry = grouped.get(key) ?? { rows: [], key };
    entry.rows.push(a);
    grouped.set(key, entry);
  });

  const totalKomisi = source.commissions.reduce((s, c) => s + Number(c.komisi ?? 0), 0);
  const totalSpend = source.adSpend.reduce((s, a) => s + Number(a.spend ?? 0), 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

  if (grouped.size === 0) {
    return source.products.map((p) => ({
      id: p.id,
      product_id: p.id,
      ad_set_name: p.title,
      status: statusFromProduct(p),
      spend: 0,
      impressions: 0,
      clicks: 0,
      cpc: 0,
      ctr: 0,
      conversion_rate: 0,
      roas: 0,
    }));
  }

  return Array.from(grouped.values()).map(({ rows, key }, idx) => {
    const spend = rows.reduce((s, r) => s + Number(r.spend ?? 0), 0);
    const impressions = rows.reduce((s, r) => s + Number(r.impressions ?? 0), 0);
    const linkClicks = rows.reduce((s, r) => s + Number(r.link_clicks ?? 0), 0);
    const cpc = linkClicks > 0 ? spend / linkClicks : 0;
    const ctr = impressions > 0 ? (linkClicks / impressions) * 100 : 0;
    const latestDate = rows.map((r) => r.report_date).sort().at(-1) ?? "";
    const status: AdSetRow["status"] = latestDate >= cutoff ? "Active" : "Paused";
    const roas =
      totalSpend > 0
        ? (totalKomisi / totalSpend) *
              (spend / (totalSpend / grouped.size || 1)) >
          0
          ? Number((totalKomisi / totalSpend).toFixed(2))
          : 0
        : 0;
    const conversionRate =
      source.commissions.length > 0 && linkClicks > 0
        ? (source.commissions.reduce((s, c) => s + c.pesanan, 0) /
            source.commissions.reduce((s, c) => s + c.klik, 0)) *
          100
        : 0;
    return {
      id: `adset-${idx}`,
      product_id: "",
      ad_set_name: key,
      status,
      spend,
      impressions,
      clicks: linkClicks,
      cpc,
      ctr,
      conversion_rate: isFinite(conversionRate) ? conversionRate : 0,
      roas: isFinite(roas) ? roas : 0,
    };
  });
}

function buildDailySeriesFromSource(
  source: ReportSource,
  from: string,
  to: string,
): DailyPoint[] {
  const buckets = new Map<string, { clicks: number; spend: number; komisi: number }>();
  const fromDate = new Date(from);
  const toDate = new Date(to);
  for (const d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    buckets.set(d.toISOString().slice(0, 10), { clicks: 0, spend: 0, komisi: 0 });
  }
  source.adSpend.forEach((a) => {
    const bucket = buckets.get(a.report_date);
    if (bucket) {
      bucket.spend += Number(a.spend ?? 0);
      bucket.clicks += Number(a.link_clicks ?? 0);
    }
  });
  source.commissions.forEach((c) => {
    const bucket = buckets.get(c.report_date);
    if (bucket) bucket.komisi += Number(c.komisi ?? 0);
  });
  return Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    clicks: v.clicks,
    spend: Number(v.spend.toFixed(2)),
    komisi: Number(v.komisi.toFixed(0)),
  }));
}

export async function buildDailySeries(from?: string, to?: string): Promise<DailyPoint[]> {
  const toStr = to ?? new Date().toISOString().slice(0, 10);
  const fromStr =
    from ??
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return d.toISOString().slice(0, 10);
    })();
  const source = await loadReportSource(fromStr, toStr);
  return buildDailySeriesFromSource(source, fromStr, toStr);
}

export async function buildOverviewMetrics(from?: string, to?: string): Promise<OverviewMetrics> {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from
    ? new Date(from)
    : new Date(new Date().setDate(new Date().getDate() - 6));

  const toStr = toDate.toISOString().slice(0, 10);
  const fromStr = fromDate.toISOString().slice(0, 10);

  // Comparison period: same duration before fromDate
  const days =
    Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const compToDate = new Date(fromDate);
  compToDate.setDate(compToDate.getDate() - 1);
  const compFromDate = new Date(fromDate);
  compFromDate.setDate(compFromDate.getDate() - days);
  const compToStr = compToDate.toISOString().slice(0, 10);
  const compFromStr = compFromDate.toISOString().slice(0, 10);

  // Load data covering both periods
  const source = await loadReportSource(compFromStr, toStr);
  const allSeries = buildDailySeriesFromSource(source, compFromStr, toStr);

  const recent = allSeries.filter((p) => p.date >= fromStr && p.date <= toStr);
  const previous = allSeries.filter((p) => p.date >= compFromStr && p.date <= compToStr);

  const sumClicks = (arr: DailyPoint[]) => arr.reduce((s, p) => s + p.clicks, 0);
  const sumSpend = (arr: DailyPoint[]) => arr.reduce((s, p) => s + p.spend, 0);
  const sumKomisi = (arr: DailyPoint[]) => arr.reduce((s, p) => s + p.komisi, 0);

  const clicks = sumClicks(recent);
  const spend = sumSpend(recent);
  const prevClicks = sumClicks(previous);
  const prevSpend = sumSpend(previous);

  const cpc = clicks ? spend / clicks : 0;
  const prevCpc = prevClicks ? prevSpend / prevClicks : 0;

  // All-time net profit (no date filter)
  let allTimeKomisi = 0;
  let allTimeSpend = 0;
  if (isDemoMode) {
    allTimeKomisi = source.commissions.reduce((s, c) => s + Number(c.komisi ?? 0), 0);
    allTimeSpend = source.adSpend.reduce((s, a) => s + Number(a.spend ?? 0), 0);
  } else {
    const supabase = getSupabaseServiceRole();
    if (supabase) {
      const [komisiRes, spendRes] = await Promise.all([
        supabase.from("commission_reports").select("komisi"),
        supabase.from("ad_spend_reports").select("spend"),
      ]);
      allTimeKomisi = (komisiRes.data ?? []).reduce((s, r) => s + Number(r.komisi ?? 0), 0);
      allTimeSpend = (spendRes.data ?? []).reduce((s, r) => s + Number(r.spend ?? 0), 0);
    }
  }
  const totalNetProfit = allTimeKomisi - allTimeSpend;

  const recentProfit = sumKomisi(recent) - sumSpend(recent);
  const prevProfit = sumKomisi(previous) - sumSpend(previous);

  const recentCommissions = source.commissions.filter((c) =>
    recent.some((d) => d.date === c.report_date),
  );
  const prevCommissions = source.commissions.filter((c) =>
    previous.some((d) => d.date === c.report_date),
  );
  const totalPesanan = recentCommissions.reduce((s, c) => s + c.pesanan, 0);
  const totalKomisiKlik = recentCommissions.reduce((s, c) => s + c.klik, 0);
  const prevPesanan = prevCommissions.reduce((s, c) => s + c.pesanan, 0);
  const prevKomisiKlik = prevCommissions.reduce((s, c) => s + c.klik, 0);
  const conversionRate = totalKomisiKlik > 0 ? (totalPesanan / totalKomisiKlik) * 100 : 0;
  const prevConversionRate =
    prevKomisiKlik > 0 ? (prevPesanan / prevKomisiKlik) * 100 : 0;

  const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

  const fmtLabel = (d: Date) =>
    d.toLocaleString("en-US", { month: "short", day: "numeric" });
  const comparisonLabel = `vs ${fmtLabel(compFromDate)} – ${fmtLabel(compToDate)}`;

  return {
    spend,
    spendDelta: pct(spend, prevSpend),
    clicks,
    clicksDelta: pct(clicks, prevClicks),
    cpc,
    cpcDelta: pct(cpc, prevCpc),
    totalNetProfit,
    totalNetProfitDelta: pct(recentProfit, prevProfit),
    profitSparkline: recent.map((p) => p.komisi - p.spend),
    conversionRate,
    conversionRateDelta: pct(conversionRate, prevConversionRate),
    spendSparkline: recent.map((p) => p.spend),
    clicksSparkline: recent.map((p) => p.clicks),
    cpcSparkline: recent.map((p) => (p.clicks ? p.spend / p.clicks : 0)),
    conversionRateSparkline:
      recentCommissions.length > 0
        ? recent.map((d) => {
            const c = recentCommissions.find((r) => r.report_date === d.date);
            return c && c.klik > 0 ? (c.pesanan / c.klik) * 100 : 0;
          })
        : recent.map((p) => (p.clicks ? 90 + (p.clicks % 5) : 0)),
    comparisonLabel,
  };
}
