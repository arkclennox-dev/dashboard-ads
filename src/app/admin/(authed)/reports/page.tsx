import { PageShell } from "@/components/page-shell";
import { listAdSpend } from "@/lib/data/ad-spend";
import { listClicks } from "@/lib/data/clicks";
import { listCommissions } from "@/lib/data/commissions";
import { formatCurrency } from "@/lib/format";
import { ReportsTable, type ReportRow } from "./reports-table";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const { from, to } = searchParams;

  const [{ items: spend }, { items: clicks }, { items: commissions }] = await Promise.all([
    listAdSpend({ page: 1, pageSize: 10000, from, to }),
    listClicks({ page: 1, pageSize: 100000, include_bots: false, include_duplicates: false, from, to }),
    listCommissions({ page: 1, pageSize: 10000, from, to }),
  ]);

  // Global totals from commission_reports
  const totalKomisi = commissions.reduce((s, c) => s + Number(c.komisi ?? 0), 0);
  const totalPesanan = commissions.reduce((s, c) => s + Number(c.pesanan ?? 0), 0);
  const totalKlikShopee = commissions.reduce((s, c) => s + Number(c.klik ?? 0), 0);

  // Group ad_spend_reports by utm_campaign
  const campaignSpend = new Map<string, { spend: number; linkClicks: number }>();
  for (const row of spend) {
    const key = row.utm_campaign ?? row.campaign_name ?? "—";
    const prev = campaignSpend.get(key) ?? { spend: 0, linkClicks: 0 };
    campaignSpend.set(key, {
      spend: prev.spend + Number(row.spend ?? 0),
      linkClicks: prev.linkClicks + Number(row.link_clicks ?? 0),
    });
  }

  // Group click_events by utm_campaign (klik masuk — internal tracking)
  const campaignClicks = new Map<string, number>();
  for (const c of clicks) {
    const key = c.utm_campaign ?? "—";
    campaignClicks.set(key, (campaignClicks.get(key) ?? 0) + 1);
  }

  // Total link clicks from Meta (for proportional attribution)
  const totalLinkClicks = Array.from(campaignSpend.values()).reduce((s, v) => s + v.linkClicks, 0);

  // Build rows
  const rows: ReportRow[] = Array.from(campaignSpend.entries()).map(([campaign, data]) => {
    const klikMasuk = campaignClicks.get(campaign) ?? 0;
    const proportion = totalLinkClicks > 0 ? data.linkClicks / totalLinkClicks : 0;
    const komisi = totalKomisi * proportion;
    const pesanan = Math.round(totalPesanan * proportion);
    const cpcMeta = data.linkClicks > 0 ? data.spend / data.linkClicks : 0;
    const cpcMasuk = klikMasuk > 0 ? data.spend / klikMasuk : 0;
    const komisiPerKlikMasuk = klikMasuk > 0 ? komisi / klikMasuk : 0;
    const profit = komisi - data.spend;
    const roas = data.spend > 0 ? komisi / data.spend : 0;
    const roi = data.spend > 0 ? (profit / data.spend) * 100 : 0;
    return {
      campaign,
      spend: data.spend,
      komisi,
      klikMeta: data.linkClicks,
      klikMasuk,
      pesanan,
      cpcMeta,
      cpcMasuk,
      komisiPerKlikMasuk,
      profit,
      roas,
      roi,
    };
  });

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
  const totalKlikMeta = rows.reduce((s, r) => s + r.klikMeta, 0);
  const totalKlikMasuk = rows.reduce((s, r) => s + r.klikMasuk, 0);
  const totalProfit = totalKomisi - totalSpend;

  return (
    <PageShell
      title="Reports"
      subtitle="Performa per kampanye — spend, klik, komisi, dan profitabilitas."
    >
      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Spend", value: formatCurrency(totalSpend) },
          { label: "Total Komisi", value: formatCurrency(totalKomisi) },
          { label: "Profit/Loss", value: formatCurrency(Math.abs(totalProfit)), color: totalProfit >= 0 ? "text-[#2aaa56]" : "text-danger", prefix: totalProfit < 0 ? "−" : "" },
          { label: "ROAS", value: totalSpend > 0 ? `${(totalKomisi / totalSpend).toFixed(2)}x` : "—" },
          { label: "Klik Meta", value: totalKlikMeta.toLocaleString() },
          { label: "Klik Masuk", value: totalKlikMasuk.toLocaleString() },
        ].map(({ label, value, color, prefix }) => (
          <div key={label} className="rounded-xl2 border border-border bg-surface-2 p-3">
            <div className="text-[11px] text-muted">{label}</div>
            <div className={`mt-1 text-base font-semibold tracking-tight ${color ?? ""}`}>
              {prefix}{value}
            </div>
          </div>
        ))}
      </div>

      <ReportsTable
        rows={rows}
        totalKomisi={totalKomisi}
        totalSpend={totalSpend}
        isEstimated={totalLinkClicks > 0 && totalKomisi > 0}
      />

      <p className="mt-3 text-[11px] text-muted">
        * Kolom bertanda bintang dihitung proporsional berdasarkan Klik Meta per kampanye.
        Total Klik Shopee: {totalKlikShopee.toLocaleString()} | Total Pesanan: {totalPesanan.toLocaleString()}
      </p>
    </PageShell>
  );
}
