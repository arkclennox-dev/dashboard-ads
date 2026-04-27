import { PageShell } from "@/components/page-shell";
import { listAdSpend } from "@/lib/data/ad-spend";
import { listClicks } from "@/lib/data/clicks";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const { items: clicks } = await listClicks({
    page: 1,
    pageSize: 10000,
    include_bots: true,
    include_duplicates: true,
  });
  const { items: spend } = await listAdSpend({ page: 1, pageSize: 10000 });

  const totalSpend = spend.reduce((s, r) => s + r.spend, 0);
  const totalClicks = clicks.length;
  const dup = clicks.filter((c) => c.is_duplicate).length;
  const bot = clicks.filter((c) => c.is_bot).length;
  const nonDup = clicks.filter((c) => !c.is_duplicate && !c.is_bot).length;
  const linkClicks = spend.reduce((s, r) => s + r.link_clicks, 0);
  const cprc = totalClicks ? totalSpend / totalClicks : 0;
  const metaCpc = linkClicks ? totalSpend / linkClicks : 0;

  const rows: Array<[string, string]> = [
    ["Spend", formatCurrency(totalSpend)],
    ["Redirect clicks", formatNumber(totalClicks)],
    ["Non-duplicate clicks", formatNumber(nonDup)],
    ["Duplicate clicks", formatNumber(dup)],
    ["Bot clicks", formatNumber(bot)],
    ["Meta link clicks", formatNumber(linkClicks)],
    ["Cost per redirect click", formatCurrency(cprc)],
    ["Meta CPC", formatCurrency(metaCpc)],
    [
      "Click gap (Meta - internal)",
      formatNumber(linkClicks - totalClicks),
    ],
    [
      "Duplicate rate",
      formatPercent(totalClicks ? (dup / totalClicks) * 100 : 0),
    ],
    [
      "Bot rate",
      formatPercent(totalClicks ? (bot / totalClicks) * 100 : 0),
    ],
  ];

  return (
    <PageShell title="Reports" subtitle="Aggregate performance across click + spend data.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl2 border border-border bg-surface-2 p-4">
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">{value}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
