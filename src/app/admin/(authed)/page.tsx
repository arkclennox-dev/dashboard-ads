import { AdSetsTable } from "@/components/ad-sets-table";
import { BarChart, LineChart } from "@/components/charts";
import {
  IconCalendar,
  IconChevronDown,
  IconDownload,
  IconFilter,
  IconRefresh,
  IconSearch,
} from "@/components/icons";
import { MetricCard } from "@/components/metric-card";
import { RedirectLinkBuilder } from "@/components/redirect-link-builder";
import { Topbar } from "@/components/topbar";
import { listProducts } from "@/lib/data/products";
import { env } from "@/lib/env";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { buildAdSetRows, buildDailySeries, buildOverviewMetrics } from "@/lib/reports";

export const dynamic = "force-dynamic";

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric" });
};

export default async function AdminOverviewPage() {
  const [rows, metrics, series, productsResult] = await Promise.all([
    buildAdSetRows(),
    buildOverviewMetrics(),
    buildDailySeries(7),
    listProducts({ page: 1, pageSize: 100 }, env.siteUrl),
  ]);
  const labels = series.map((p) => dayLabel(p.date));

  return (
    <div className="flex flex-col">
      <Topbar
        title="Overview"
        subtitle="Monitor performance and manage your Meta Ads campaigns"
      />

      <div className="grid grid-cols-1 gap-5 px-6 pb-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-3">
              All Campaigns <IconChevronDown />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-3">
              <IconFilter /> Filters
            </button>
            <div className="relative min-w-[260px] flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search by name or ID..."
                className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-3">
              <IconCalendar /> May 16 – May 22, 2025
              <IconChevronDown />
            </button>
            <button
              className="rounded-lg border border-border bg-surface-2 p-2 text-ink-2 hover:bg-surface-3"
              aria-label="Refresh"
            >
              <IconRefresh />
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-600">
              <IconDownload /> Export
            </button>
          </div>

          <AdSetsTable rows={rows} total={Math.max(rows.length, 12)} />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <MetricCard
              label="Spend"
              hint="Total ad spend in the selected window."
              value={formatCurrency(metrics.spend)}
              delta={metrics.spendDelta}
              values={metrics.spendSparkline}
              comparison="vs May 9 – May 15"
            />
            <MetricCard
              label="Clicks"
              hint="Total clicks tracked via /[slug]."
              value={formatNumber(metrics.clicks)}
              delta={metrics.clicksDelta}
              values={metrics.clicksSparkline}
              comparison="vs May 9 – May 15"
            />
            <MetricCard
              label="CPC"
              hint="Spend ÷ clicks."
              value={formatCurrency(metrics.cpc)}
              delta={metrics.cpcDelta}
              values={metrics.cpcSparkline}
              comparison="vs May 9 – May 15"
            />
            <MetricCard
              label="CTR"
              hint="Internal clicks ÷ Meta impressions."
              value={formatPercent(metrics.ctr)}
              delta={metrics.ctrDelta}
              values={metrics.ctrSparkline}
              comparison="vs May 9 – May 15"
            />
            <MetricCard
              label="Conversion Rate"
              hint="Pesanan ÷ klik dari data komisi Shopee."
              value={formatPercent(metrics.conversionRate)}
              delta={metrics.conversionRateDelta}
              values={metrics.conversionRateSparkline}
              comparison="vs May 9 – May 15"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl2 border border-border bg-surface-2 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Komisi</h3>
                <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2">
                  Daily <IconChevronDown width={14} height={14} />
                </button>
              </div>
              <LineChart
                values={series.map((p) => p.komisi)}
                labels={labels}
                color="#22c55e"
                formatY={(n) => `Rp ${Math.round(n / 1000)}k`}
              />
            </div>
            <div className="rounded-xl2 border border-border bg-surface-2 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Spend by Date</h3>
                <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2">
                  Daily <IconChevronDown width={14} height={14} />
                </button>
              </div>
              <BarChart
                values={series.map((p) => p.spend)}
                labels={labels}
                color="#3b82f6"
                formatY={(n) => `${Math.round(n)}`}
              />
            </div>
            <div className="rounded-xl2 border border-border bg-surface-2 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Clicks Over Time</h3>
                <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2">
                  Daily <IconChevronDown width={14} height={14} />
                </button>
              </div>
              <LineChart
                values={series.map((p) => p.clicks)}
                labels={labels}
                color="#f59e0b"
                formatY={(n) => `${Math.round(n)}`}
              />
            </div>
          </div>
        </div>

        <div className="xl:sticky xl:top-6">
          <RedirectLinkBuilder
            products={productsResult.items.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              destination_url: p.destination_url,
              short_code: p.short_code,
            }))}
            siteUrl={env.siteUrl}
          />
        </div>
      </div>
    </div>
  );
}
