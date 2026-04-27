import { PageShell } from "@/components/page-shell";
import { listAdSpend } from "@/lib/data/ad-spend";
import { formatCurrency, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAdSpendPage() {
  const { items, total } = await listAdSpend({ page: 1, pageSize: 50 });
  return (
    <PageShell title="Ad spend" subtitle="Manual Meta Ads spend reports.">
      <div className="rounded-xl2 border border-border bg-surface-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <h2 className="text-sm font-semibold">Reports</h2>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
            {total} rows
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                <th>Date</th>
                <th>Campaign</th>
                <th>Ad set</th>
                <th>Ad</th>
                <th>Spend</th>
                <th>Impr.</th>
                <th>Link clicks</th>
                <th>LPV</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr
                  key={a.id}
                  className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                >
                  <td className="text-ink-2">{a.report_date}</td>
                  <td className="font-medium text-ink">{a.campaign_name}</td>
                  <td className="text-ink-2">{a.adset_name ?? "—"}</td>
                  <td className="text-ink-2">{a.ad_name ?? "—"}</td>
                  <td className="text-ink-2">{formatCurrency(a.spend)}</td>
                  <td className="text-ink-2">{formatNumber(a.impressions)}</td>
                  <td className="text-ink-2">{formatNumber(a.link_clicks)}</td>
                  <td className="text-ink-2">{formatNumber(a.landing_page_views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
