import { DashboardClient } from "@/components/dashboard-client";
import { RedirectLinkBuilder } from "@/components/redirect-link-builder";
import { Topbar } from "@/components/topbar";
import { listProducts } from "@/lib/data/products";
import { getEffectiveSiteUrl } from "@/lib/data/settings";
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

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const from = searchParams.from ?? defaultFrom();
  const to = searchParams.to ?? defaultTo();

  const siteUrl = await getEffectiveSiteUrl();
  const [rows, metrics, series, productsResult] = await Promise.all([
    buildAdSetRows(from, to),
    buildOverviewMetrics(from, to),
    buildDailySeries(from, to),
    listProducts({ page: 1, pageSize: 100 }, siteUrl),
  ]);
  const labels = series.map((p) => dayLabel(p.date));

  return (
    <div className="flex flex-col">
      <Topbar
        title="Overview"
        subtitle="Monitor performance and manage your Meta Ads campaigns"
      />

      <div className="grid grid-cols-1 gap-5 px-6 pb-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DashboardClient
          from={from}
          to={to}
          rows={rows}
          metrics={metrics}
          series={series}
          labels={labels}
        />

        <div className="xl:sticky xl:top-6">
          <RedirectLinkBuilder
            products={productsResult.items.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              destination_url: p.destination_url,
              short_code: p.short_code,
            }))}
            siteUrl={siteUrl}
          />
        </div>
      </div>
    </div>
  );
}
