import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { listCommissions } from "@/lib/data/commissions";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { KomisiForm } from "./komisi-form";
import { KomisiRowActions } from "./row-actions";

export const dynamic = "force-dynamic";

export default async function AdminKomisiPage() {
  const { items, total } = await listCommissions({ page: 1, pageSize: 60 });

  const totalKomisi = items.reduce((s, r) => s + r.komisi, 0);
  const totalPesanan = items.reduce((s, r) => s + r.pesanan, 0);
  const totalKlik = items.reduce((s, r) => s + r.klik, 0);
  const convRate = totalKlik > 0 ? ((totalPesanan / totalKlik) * 100).toFixed(1) : "0.0";

  return (
    <PageShell
      title="Komisi"
      subtitle="Input pendapatan Shopee Affiliate — klik, pesanan, dan komisi harian."
    >
      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <div className="text-xs text-muted">Total Komisi</div>
          <div className="mt-1 text-xl font-semibold">{formatCurrency(totalKomisi)}</div>
        </div>
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <div className="text-xs text-muted">Total Pesanan</div>
          <div className="mt-1 text-xl font-semibold">{formatNumber(totalPesanan)}</div>
        </div>
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <div className="text-xs text-muted">Total Klik</div>
          <div className="mt-1 text-xl font-semibold">{formatNumber(totalKlik)}</div>
        </div>
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <div className="text-xs text-muted">
            Conversion Rate
            <Link href="/admin" className="ml-1 text-brand-300 hover:underline text-[10px]">
              ↗ Dashboard
            </Link>
          </div>
          <div className="mt-1 text-xl font-semibold">{convRate}%</div>
        </div>
      </div>

      {/* Input form */}
      <div className="mb-5 rounded-xl2 border border-border bg-surface-2 p-4">
        <h2 className="mb-3 text-sm font-semibold">Tambah data harian</h2>
        <KomisiForm />
      </div>

      {/* Data table */}
      <div className="rounded-xl2 border border-border bg-surface-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <h2 className="text-sm font-semibold">Riwayat Komisi</h2>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
            {total} baris
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                <th>Tanggal</th>
                <th>Klik</th>
                <th>Pesanan</th>
                <th>Conv. Rate</th>
                <th>Produk Terjual</th>
                <th>Total Pembelian</th>
                <th>Komisi</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted">
                    Belum ada data. Tambahkan di form di atas.
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const cr = r.klik > 0 ? ((r.pesanan / r.klik) * 100).toFixed(1) : "0.0";
                  return (
                    <tr
                      key={r.id}
                      className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                    >
                      <td className="font-medium text-ink">{formatDate(r.report_date)}</td>
                      <td className="text-ink-2">{formatNumber(r.klik)}</td>
                      <td className="text-ink-2">{formatNumber(r.pesanan)}</td>
                      <td className="text-ink-2">{cr}%</td>
                      <td className="text-ink-2">{formatNumber(r.produk_terjual)}</td>
                      <td className="text-ink-2">{formatCurrency(r.pembelian)}</td>
                      <td className="font-semibold text-success">{formatCurrency(r.komisi)}</td>
                      <td className="text-right">
                        <KomisiRowActions id={r.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
