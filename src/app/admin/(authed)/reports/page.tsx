import { PageShell } from "@/components/page-shell";
import { listAdSpend } from "@/lib/data/ad-spend";
import { listCommissions } from "@/lib/data/commissions";
import { getShopeeClickSummaries } from "@/lib/data/shopee-clicks";
import { formatCurrency } from "@/lib/format";
import { ReportsTable, type ReportRow } from "./reports-table";
import { ShopeeCsvImport } from "./shopee-csv-import";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const { from, to } = searchParams;

  const [{ items: spend }, { items: commissions }, shopeeClicks] = await Promise.all([
    listAdSpend({ page: 1, pageSize: 10000, from, to }),
    listCommissions({ page: 1, pageSize: 10000, from, to }),
    getShopeeClickSummaries(),
  ]);

  // Global totals
  const totalKomisi = commissions.reduce((s, c) => s + Number(c.komisi ?? 0), 0);
  const totalPesanan = commissions.reduce((s, c) => s + Number(c.pesanan ?? 0), 0);
  const totalKlikShopee = commissions.reduce((s, c) => s + Number(c.klik ?? 0), 0);
  const totalSpend = spend.reduce((s, r) => s + Number(r.spend ?? 0), 0);

  // Shopee click lookup by campaign_key
  const shopeeMap = new Map(shopeeClicks.map((r) => [r.campaign_key, r]));

  // Group ad_spend_reports by utm_campaign
  const campaignMap = new Map<string, { spend: number; linkClicks: number }>();
  for (const row of spend) {
    const key = row.utm_campaign ?? row.campaign_name ?? "—";
    const prev = campaignMap.get(key) ?? { spend: 0, linkClicks: 0 };
    campaignMap.set(key, {
      spend: prev.spend + Number(row.spend ?? 0),
      linkClicks: prev.linkClicks + Number(row.link_clicks ?? 0),
    });
  }

  const rows: ReportRow[] = Array.from(campaignMap.entries()).map(([campaign, data]) => {
    const shopee = shopeeMap.get(campaign);
    const klikFB = shopee?.klikFB ?? 0;
    const klikIG = shopee?.klikIG ?? 0;
    const klikLainnya = shopee?.klikLainnya ?? 0;
    const klikMasuk = klikFB + klikIG + klikLainnya;
    const cpcMeta = data.linkClicks > 0 ? data.spend / data.linkClicks : 0;
    const cpcMasuk = klikMasuk > 0 ? data.spend / klikMasuk : 0;
    return { campaign, spend: data.spend, klikMeta: data.linkClicks, klikFB, klikIG, klikLainnya, klikMasuk, cpcMeta, cpcMasuk };
  });

  const totalKlikMeta = rows.reduce((s, r) => s + r.klikMeta, 0);
  const totalKlikMasuk = rows.reduce((s, r) => s + r.klikMasuk, 0);
  const totalProfit = totalKomisi - totalSpend;

  return (
    <PageShell
      title="Reports"
      subtitle="Performa per kampanye berdasarkan data ad spend & klik Shopee."
    >
      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Spend", value: formatCurrency(totalSpend) },
          { label: "Total Komisi", value: formatCurrency(totalKomisi) },
          {
            label: "Profit/Loss",
            value: `${totalProfit < 0 ? "−" : ""}${formatCurrency(Math.abs(totalProfit))}`,
            color: totalProfit >= 0 ? "text-[#2aaa56]" : "text-danger",
          },
          { label: "ROAS", value: totalSpend > 0 ? `${(totalKomisi / totalSpend).toFixed(2)}x` : "—" },
          { label: "Klik Meta", value: totalKlikMeta.toLocaleString() },
          { label: "Klik Shopee", value: totalKlikShopee.toLocaleString() },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl2 border border-border bg-surface-2 p-3">
            <div className="text-[11px] text-muted">{label}</div>
            <div className={`mt-1 text-base font-semibold tracking-tight ${color ?? ""}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Shopee click import */}
      <div className="mb-4">
        <ShopeeCsvImport />
      </div>

      <ReportsTable rows={rows} totalKomisi={totalKomisi} totalSpend={totalSpend} />

      <p className="mt-3 text-[11px] text-muted">
        Komisi, Pesanan, Klik Shopee adalah total global dari laporan Shopee — tidak terikat per kampanye.
        Total Pesanan: {totalPesanan.toLocaleString()} · Total Klik Masuk (Shopee): {totalKlikMasuk.toLocaleString()}
      </p>
    </PageShell>
  );
}
