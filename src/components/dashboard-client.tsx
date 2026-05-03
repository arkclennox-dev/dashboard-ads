"use client";

import { useState } from "react";
import type { AdSetRow, DailyPoint, OverviewMetrics } from "@/lib/reports";
import { MetricCard } from "./metric-card";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardFilters } from "./dashboard-filters";
import { AdSetsTable } from "./ad-sets-table";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

interface DashboardClientProps {
  from: string;
  to: string;
  rows: AdSetRow[];
  metrics: OverviewMetrics;
  series: DailyPoint[];
  labels: string[];
}

export function DashboardClient({
  from,
  to,
  rows,
  metrics,
  series,
  labels,
}: DashboardClientProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-5">
      <DashboardFilters
        from={from}
        to={to}
        search={search}
        onSearchChange={setSearch}
        rows={rows}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard
          label="Spend"
          hint="Total ad spend in the selected window."
          value={formatCurrency(metrics.spend)}
          delta={metrics.spendDelta}
          values={metrics.spendSparkline}
          comparison={metrics.comparisonLabel}
        />
        <MetricCard
          label="Clicks"
          hint="Total link clicks dari Meta Ads (link_clicks di ad_spend_reports)."
          value={formatNumber(metrics.clicks)}
          delta={metrics.clicksDelta}
          values={metrics.clicksSparkline}
          comparison={metrics.comparisonLabel}
        />
        <MetricCard
          label="CPC"
          hint="Spend ÷ Meta link clicks."
          value={formatCurrency(metrics.cpc)}
          delta={metrics.cpcDelta}
          values={metrics.cpcSparkline}
          comparison={metrics.comparisonLabel}
        />
        <MetricCard
          label="Profit"
          hint="Total komisi semua waktu dikurangi total spend."
          value={formatCurrency(metrics.totalNetProfit)}
          delta={metrics.totalNetProfitDelta}
          values={metrics.profitSparkline}
          comparison={metrics.comparisonLabel}
        />
        <MetricCard
          label="Conversion Rate"
          hint="Pesanan ÷ klik dari data komisi Shopee."
          value={formatPercent(metrics.conversionRate)}
          delta={metrics.conversionRateDelta}
          values={metrics.conversionRateSparkline}
          comparison={metrics.comparisonLabel}
        />
      </div>

      <DashboardCharts
        komisi={series.map((p) => p.komisi)}
        spend={series.map((p) => p.spend)}
        clicks={series.map((p) => p.clicks)}
        labels={labels}
      />

      <AdSetsTable rows={rows} search={search} />
    </div>
  );
}
