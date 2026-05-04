import { DashboardClient } from "@/components/dashboard-client";
import { Topbar } from "@/components/topbar";
import { buildAdSetRows, buildDailySeries, buildOverviewMetrics } from "@/lib/reports";

export const dynamic = "force-dynamic";

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric" });
};

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardAdsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const from = searchParams.from ?? defaultFrom();
  const to = searchParams.to ?? defaultTo();

  const [rows, metrics, series] = await Promise.all([
    buildAdSetRows(from, to),
    buildOverviewMetrics(from, to),
    buildDailySeries(from, to),
  ]);
  const labels = series.map((p) => dayLabel(p.date));

  return (
    <div className="flex flex-col">
      <Topbar
        title="Dashboard Ads"
        subtitle="Monitor performa Meta Ads dan data kampanye kamu"
      />
      <div className="px-6 pb-8">
        <DashboardClient
          from={from}
          to={to}
          rows={rows}
          metrics={metrics}
          series={series}
          labels={labels}
        />
      </div>
    </div>
  );
}
