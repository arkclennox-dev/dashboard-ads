import { PageShell } from "@/components/page-shell";
import { RedirectLinkBuilder } from "@/components/redirect-link-builder";
import { listProducts } from "@/lib/data/products";
import { env } from "@/lib/env";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  const { items } = await listProducts(
    { page: 1, pageSize: 100 },
    env.siteUrl,
  );
  return (
    <PageShell
      title="Redirect Builder"
      subtitle="Compose tracked redirect URLs for your campaigns."
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl2 border border-border bg-surface-2">
          <div className="flex items-center gap-3 px-4 py-3">
            <h2 className="text-sm font-semibold">Redirect URLs</h2>
            <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
              {items.length} active
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted">
                <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                  <th>Title</th>
                  <th>Redirect URL</th>
                  <th>Destination</th>
                  <th>Clicks</th>
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
                        /go/{p.slug}
                      </code>
                    </td>
                    <td className="text-ink-2 max-w-[260px] truncate">
                      {p.destination_url}
                    </td>
                    <td className="text-ink-2">{formatNumber(p.total_clicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RedirectLinkBuilder />
      </div>
    </PageShell>
  );
}
