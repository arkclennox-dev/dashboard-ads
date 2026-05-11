import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { listLandingPages } from "@/lib/data/landing-pages";
import { getLandingPageVisits } from "@/lib/data/clicks";
import { formatDate, formatNumber } from "@/lib/format";
import { LandingPageRowActions } from "./row-actions";
import { NewLandingPageButton } from "./new-page-button";

export const dynamic = "force-dynamic";

export default async function LandingPagesPage() {
  const [{ items, total }, visits] = await Promise.all([
    listLandingPages({ page: 1, pageSize: 50 }),
    getLandingPageVisits(),
  ]);
  return (
    <PageShell
      title="Landing pages"
      subtitle="Public pages at /rekomendasi/[slug] that group affiliate products."
      actions={<NewLandingPageButton />}
    >
      <div className="rounded-xl2 border border-border bg-surface-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <h2 className="text-sm font-semibold">All landing pages</h2>
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
                <th>Status</th>
                <th>Kunjungan</th>
                <th>Created At</th>
                <th>Public URL</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted">
                    No landing pages yet.{" "}
                    <Link href="/landing-pages/new" className="text-brand-300 hover:underline">
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
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          p.status === "published"
                            ? "bg-success/10 text-success"
                            : p.status === "draft"
                              ? "bg-warn/15 text-warn"
                              : "bg-muted-2/15 text-muted"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="text-ink-2">{formatNumber(visits[p.slug] ?? 0)}</td>
                    <td className="text-ink-2">{formatDate(p.created_at)}</td>
                    <td>
                      <a
                        className="rounded bg-surface px-2 py-1 text-xs text-brand-300 hover:underline"
                        href={`/lp/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /lp/{p.slug}
                      </a>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/landing-pages/${p.id}/edit`} className="rounded border border-border bg-surface px-2 py-1 text-xs text-ink-2 hover:bg-surface-3">
                          Edit Builder
                        </Link>
                        <LandingPageRowActions id={p.id} title={p.title} status={p.status} />
                      </div>
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
