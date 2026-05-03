import { PageShell } from "@/components/page-shell";
import { Sparkline } from "@/components/charts";
import { RedirectLinkBuilder } from "@/components/redirect-link-builder";
import { listProducts } from "@/lib/data/products";
import { getRedirectClickStats } from "@/lib/data/clicks";
import { env } from "@/lib/env";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  const [{ items }, stats] = await Promise.all([
    listProducts({ page: 1, pageSize: 100 }, env.siteUrl),
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
        {/* Redirect URLs table */}
        <div className="rounded-xl2 border border-border bg-surface-2">
          <div className="flex items-center gap-3 px-4 py-3">
            <h2 className="text-sm font-semibold">Redirect URLs</h2>
            <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
              {items.length} produk
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted">
                <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                  <th>Produk</th>
                  <th>Redirect URL</th>
                  <th>Destination</th>
                  <th>Klik</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                  >
                    <td className="font-medium text-ink">{p.title}</td>
                    <td>
                      <code className="rounded bg-surface px-2 py-1 text-xs text-brand-300">
                        {p.short_code ? `/${p.short_code}` : `/go/${p.slug}`}
                      </code>
                    </td>
                    <td className="max-w-[260px] truncate text-ink-2">{p.destination_url}</td>
                    <td className="text-ink-2">{formatNumber(p.total_clicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RedirectLinkBuilder
          products={items.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            destination_url: p.destination_url,
            short_code: p.short_code,
          }))}
          siteUrl={env.siteUrl}
        />
      </div>
    </PageShell>
  );
}
