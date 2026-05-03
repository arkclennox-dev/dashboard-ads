import { PageShell } from "@/components/page-shell";
import { Sparkline } from "@/components/charts";
import { RedirectLinkBuilder } from "@/components/redirect-link-builder";
import { RedirectsTable } from "@/components/redirects-table";
import { listProducts } from "@/lib/data/products";
import { getRedirectClickStats } from "@/lib/data/clicks";
import { getEffectiveSiteUrl } from "@/lib/data/settings";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  const siteUrl = await getEffectiveSiteUrl();
  const [{ items }, stats] = await Promise.all([
    listProducts({ page: 1, pageSize: 100 }, siteUrl),
    getRedirectClickStats(),
  ]);

  const recent7 = stats.daily.slice(-7);
  const prev7 = stats.daily.slice(0, 7);
  const recent7total = recent7.reduce((s, d) => s + d.clicks, 0);
  const prev7total = prev7.reduce((s, d) => s + d.clicks, 0);
  const delta = prev7total === 0 ? 0 : ((recent7total - prev7total) / prev7total) * 100;

  return (
    <PageShell
      title="Redirect Builder"
      subtitle="Link pendek tertracking untuk kampanye iklan kamu."
    >
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <p className="text-xs text-muted">Total Klik (semua waktu)</p>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(stats.total)}</p>
        </div>
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <p className="text-xs text-muted">7 Hari Terakhir</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{formatNumber(stats.last7days)}</p>
            {delta !== 0 && (
              <span className={`text-xs font-semibold ${delta >= 0 ? "text-success" : "text-danger"}`}>
                {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <p className="text-xs text-muted">Klik per Hari (14 hari)</p>
          <div className="mt-2 -mx-1">
            <Sparkline values={stats.daily.map((d) => d.clicks)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <RedirectsTable
          items={items.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            short_code: p.short_code,
            destination_url: p.destination_url,
            total_clicks: p.total_clicks,
          }))}
        />

        <RedirectLinkBuilder
          products={items.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            destination_url: p.destination_url,
            short_code: p.short_code,
          }))}
          siteUrl={siteUrl}
        />
      </div>
    </PageShell>
  );
}
