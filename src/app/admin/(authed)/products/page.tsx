import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { listProducts } from "@/lib/data/products";
import { env } from "@/lib/env";
import { formatDate, formatNumber } from "@/lib/format";
import { ProductRowActions } from "./product-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { items, total } = await listProducts(
    { page: 1, pageSize: 50 },
    env.siteUrl,
  );
  return (
    <PageShell
      title="Products"
      subtitle="Affiliate destinations exposed via /go/[slug]"
      actions={
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New product
        </Link>
      }
    >
      <div className="rounded-xl2 border border-border bg-surface-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <h2 className="text-sm font-semibold">All products</h2>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
            {total} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                <th>Title</th>
                <th>Slug</th>
                <th>Source</th>
                <th>Status</th>
                <th>Total Clicks</th>
                <th>Created At</th>
                <th>Redirect</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-sm text-muted"
                  >
                    No products yet.{" "}
                    <Link
                      href="/admin/products/new"
                      className="text-brand-300 hover:underline"
                    >
                      Create the first one
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr
                    key={p.id}
                    className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                  >
                    <td className="font-medium text-ink">{p.title}</td>
                    <td className="text-muted">{p.slug}</td>
                    <td className="text-ink-2">{p.source_platform}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          p.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted-2/15 text-muted"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="text-ink-2">{formatNumber(p.total_clicks)}</td>
                    <td className="text-ink-2">{formatDate(p.created_at)}</td>
                    <td>
                      <code className="rounded bg-surface px-2 py-1 text-xs text-brand-300">
                        {p.short_code ? `/${p.short_code}` : `/go/${p.slug}`}
                      </code>
                    </td>
                    <td className="text-right">
                      <ProductRowActions
                        id={p.id}
                        title={p.title}
                        status={p.status}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
