import { PageShell } from "@/components/page-shell";
import { listAdSpend } from "@/lib/data/ad-spend";
import { listCommissions } from "@/lib/data/commissions";
import { getTenantId } from "@/lib/data/tenants";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { ReportsTable, type ReportRow } from "./reports-table";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const { from, to } = searchParams;

  const tenantId = await getTenantId();

  const [{ items: spend }, { items: commissions }, klikMasukRows] = await Promise.all([
    listAdSpend({ page: 1, pageSize: 10000, from, to }),
    listCommissions({ page: 1, pageSize: 10000, from, to }),
    (async () => {
      if (!tenantId) return [];
      const sb = getSupabaseServiceRole();
      if (!sb) return [];
      const { data } = await sb
        .from("campaign_klik_masuk")
        .select("utm_campaign, klik_masuk")
        .eq("tenant_id", tenantId);
      return (data ?? []) as { utm_campaign: string; klik_masuk: number }[];
    })(),
  ]);

  // Global totals
  const totalKomisi = commissions.reduce((s, c) => s + Number(c.komisi ?? 0), 0);
  const totalPesanan = commissions.reduce((s, c) => s + Number(c.pesanan ?? 0), 0);
  const totalKlikShopee = commissions.reduce((s, c) => s + Number(c.klik ?? 0), 0);
  const totalSpend = spend.reduce((s, r) => s + Number(r.spend ?? 0), 0);

  // klik_masuk lookup by campaign
  const klikMasukMap = new Map(klikMasukRows.map((r) => [r.utm_campaign, r.klik_masuk]));

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
    const klikMasuk = klikMasukMap.get(campaign) ?? 0;
    const cpcMeta = data.linkClicks > 0 ? data.spend / data.linkClicks : 0;
    const cpcMasuk = klikMasuk > 0 ? data.spend / klikMasuk : 0;
    return { campaign, spend: data.spend, klikMeta: data.linkClicks, klikMasuk, cpcMeta, cpcMasuk };
  });

  const totalKlikMeta = rows.reduce((s, r) => s + r.klikMeta, 0);
  const totalProfit = totalKomisi - totalSpend;

  return (
    <PageShell
      title="Reports"
      subtitle="Performa per kampanye berdasarkan data ad spend."
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

      <ReportsTable rows={rows} totalKomisi={totalKomisi} totalSpend={totalSpend} />

      <p className="mt-3 text-[11px] text-muted">
        Komisi, Pesanan, Klik Shopee adalah total global dari laporan Shopee — tidak terikat per kampanye.
        Total Pesanan: {totalPesanan.toLocaleString()}
      </p>
    </PageShell>
  );
}
