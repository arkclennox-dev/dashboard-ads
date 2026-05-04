import { PageShell } from "@/components/page-shell";
import { listClicks } from "@/lib/data/clicks";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClicksPage() {
  const { items, total } = await listClicks({
    page: 1,
    pageSize: 50,
    include_bots: true,
    include_duplicates: true,
  });
  return (
    <PageShell title="Klik" subtitle="Recent click events dari redirect link kamu.">
      <div className="mb-3 flex justify-end">
        <a
          href="/api/clicks/export.csv"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-3"
        >
          Export CSV
        </a>
      </div>
      <div className="rounded-xl2 border border-border bg-surface-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <h2 className="text-sm font-semibold">Click events</h2>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
            {total} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                <th>Created At</th>
                <th>Product</th>
                <th>Landing Page</th>
                <th>Campaign</th>
                <th>Content</th>
                <th>Source</th>
                <th>Device</th>
                <th>Dup?</th>
                <th>Bot?</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                >
                  <td className="text-ink-2">{formatDate(c.created_at, { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="text-ink">{c.product_slug ?? "—"}</td>
                  <td className="text-ink-2">{c.landing_page_slug ?? "—"}</td>
                  <td className="text-ink-2">{c.utm_campaign ?? "—"}</td>
                  <td className="text-ink-2">{c.utm_content ?? "—"}</td>
                  <td className="text-ink-2">{c.utm_source ?? "—"}</td>
                  <td className="text-ink-2">{c.device_type ?? "—"}</td>
                  <td><Badge value={c.is_duplicate} /></td>
                  <td><Badge value={c.is_bot} variant="warn" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

function Badge({ value, variant = "muted" }: { value: boolean; variant?: "muted" | "warn" }) {
  if (!value) return <span className="rounded-full bg-muted-2/15 px-2 py-0.5 text-[11px] text-muted">No</span>;
  const cls = variant === "warn" ? "bg-warn/15 text-warn" : "bg-danger/15 text-danger";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>Yes</span>;
}
