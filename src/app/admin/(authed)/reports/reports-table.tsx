"use client";

import { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/format";

export interface ReportRow {
  campaign: string;
  spend: number;
  klikMeta: number;
  klikFB: number;
  klikIG: number;
  klikLainnya: number;
  klikMasuk: number; // = klikFB + klikIG + klikLainnya
  cpcMeta: number;
  cpcMasuk: number;
}

type SortKey = keyof ReportRow | "efisiensi";

function efisiensi(row: ReportRow): number | null {
  if (row.klikMeta === 0 || row.klikMasuk === 0) return null;
  return (row.klikMasuk / row.klikMeta) * 100;
}

function efisiensiColor(pct: number): string {
  if (pct >= 80) return "bg-[#2aaa56]/15 text-[#2aaa56]";
  if (pct >= 60) return "bg-warn/15 text-warn";
  return "bg-danger/10 text-danger";
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="opacity-20">↕</span>;
  return <span className="text-brand-300">{dir === "asc" ? "↑" : "↓"}</span>;
}

interface Props {
  rows: ReportRow[];
  totalKomisi: number;
  totalSpend: number;
}

export function ReportsTable({ rows, totalKomisi, totalSpend }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = sortKey === "efisiensi" ? (efisiensi(a) ?? -1) : a[sortKey as keyof ReportRow];
    const bv = sortKey === "efisiensi" ? (efisiensi(b) ?? -1) : b[sortKey as keyof ReportRow];
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalKlikMeta = rows.reduce((s, r) => s + r.klikMeta, 0);
  const totalKlikFB = rows.reduce((s, r) => s + r.klikFB, 0);
  const totalKlikIG = rows.reduce((s, r) => s + r.klikIG, 0);
  const totalKlikLainnya = rows.reduce((s, r) => s + r.klikLainnya, 0);
  const totalKlikMasuk = rows.reduce((s, r) => s + r.klikMasuk, 0);
  const totalProfit = totalKomisi - totalSpend;

  const hasShopeeData = rows.some((r) => r.klikMasuk > 0);

  function Th({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
    return (
      <th
        onClick={() => handleSort(k)}
        className={`px-3 py-2.5 font-medium cursor-pointer select-none hover:text-ink whitespace-nowrap ${right ? "text-right" : ""}`}
      >
        {label} <SortIcon active={sortKey === k} dir={sortDir} />
      </th>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-border bg-surface-2">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-muted border-b border-border">
          <tr>
            <Th k="campaign" label="Nama Iklan" />
            <Th k="spend" label="Ad Spend" right />
            <Th k="klikMeta" label="Klik Meta" right />
            <th className="px-3 py-2.5 text-right whitespace-nowrap text-[#1877F2]/70">Klik FB</th>
            <th className="px-3 py-2.5 text-right whitespace-nowrap text-[#E1306C]/70">Klik IG</th>
            <th className="px-3 py-2.5 text-right whitespace-nowrap text-muted">Klik Lainnya</th>
            <Th k="klikMasuk" label="Klik Masuk" right />
            <Th k="efisiensi" label="Efisiensi" right />
            <Th k="cpcMeta" label="CPC Meta" right />
            <Th k="cpcMasuk" label="CPC Masuk" right />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted">
                Belum ada data. Upload ad spend report terlebih dahulu.
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => {
              const pct = efisiensi(row);
              return (
                <tr key={row.campaign} className="border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-2.5">
                  <td className="max-w-[200px]">
                    <span className="flex items-center gap-2">
                      <span className="text-muted text-xs">{i + 1}</span>
                      <span className="truncate font-medium text-ink" title={row.campaign}>{row.campaign}</span>
                    </span>
                  </td>
                  <td className="text-right text-ink-2">{formatCurrency(row.spend)}</td>
                  <td className="text-right text-ink-2">{formatNumber(row.klikMeta)}</td>
                  <td className="text-right">
                    {row.klikFB > 0
                      ? <span className="text-[#1877F2]">{formatNumber(row.klikFB)}</span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td className="text-right">
                    {row.klikIG > 0
                      ? <span className="text-[#E1306C]">{formatNumber(row.klikIG)}</span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td className="text-right text-ink-2">
                    {row.klikLainnya > 0 ? formatNumber(row.klikLainnya) : <span className="text-muted">—</span>}
                  </td>
                  <td className="text-right font-medium text-ink">
                    {row.klikMasuk > 0 ? formatNumber(row.klikMasuk) : <span className="text-muted">—</span>}
                  </td>
                  <td className="text-right">
                    {pct === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${efisiensiColor(pct)}`}>
                        {pct.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="text-right text-ink-2">{formatCurrency(row.cpcMeta)}</td>
                  <td className="text-right text-ink-2">
                    {row.klikMasuk > 0 ? formatCurrency(row.cpcMasuk) : <span className="text-muted">—</span>}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot className="border-t-2 border-border">
          <tr className="bg-surface-3/50 text-xs font-semibold text-ink [&>td]:px-3 [&>td]:py-2.5">
            <td>TOTAL ({rows.length} kampanye)</td>
            <td className="text-right">{formatCurrency(totalSpend)}</td>
            <td className="text-right">{formatNumber(totalKlikMeta)}</td>
            <td className="text-right text-[#1877F2]">{totalKlikFB > 0 ? formatNumber(totalKlikFB) : "—"}</td>
            <td className="text-right text-[#E1306C]">{totalKlikIG > 0 ? formatNumber(totalKlikIG) : "—"}</td>
            <td className="text-right">{totalKlikLainnya > 0 ? formatNumber(totalKlikLainnya) : "—"}</td>
            <td className="text-right">{totalKlikMasuk > 0 ? formatNumber(totalKlikMasuk) : "—"}</td>
            <td className="text-right">
              {totalKlikMeta > 0 && totalKlikMasuk > 0
                ? `${((totalKlikMasuk / totalKlikMeta) * 100).toFixed(1)}%`
                : "—"}
            </td>
            <td className="text-right">{formatCurrency(totalKlikMeta > 0 ? totalSpend / totalKlikMeta : 0)}</td>
            <td className="text-right">{formatCurrency(totalKlikMasuk > 0 ? totalSpend / totalKlikMasuk : 0)}</td>
          </tr>
        </tfoot>
      </table>

      {!hasShopeeData && rows.length > 0 && (
        <div className="border-t border-border px-4 py-2 text-xs text-muted">
          Belum ada data klik Shopee. Upload laporan klik di atas untuk mengisi kolom Klik FB / IG / Lainnya.
        </div>
      )}

      {/* Global summary */}
      <div className="border-t border-border px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <span>Total Komisi (global): <strong className="text-ink">{formatCurrency(totalKomisi)}</strong></span>
        <span>Profit/Loss: <strong className={totalProfit >= 0 ? "text-[#2aaa56]" : "text-danger"}>{totalProfit >= 0 ? "" : "−"}{formatCurrency(Math.abs(totalProfit))}</strong></span>
        <span>ROAS: <strong className="text-ink">{totalSpend > 0 ? `${(totalKomisi / totalSpend).toFixed(2)}x` : "—"}</strong></span>
      </div>
    </div>
  );
}
