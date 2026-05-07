"use client";

import { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/format";

export interface ReportRow {
  campaign: string;
  spend: number;
  komisi: number;
  klikMeta: number;
  klikMasuk: number;
  pesanan: number;
  cpcMeta: number;
  cpcMasuk: number;
  komisiPerKlikMasuk: number;
  profit: number;
  roas: number;
  roi: number;
}

type SortKey = keyof ReportRow;

function roiColor(roi: number): string {
  if (roi >= 100) return "bg-[#1a7a3a]/20 text-[#2aaa56]";
  if (roi >= 50)  return "bg-[#2aaa56]/15 text-[#2aaa56]";
  if (roi >= 0)   return "bg-[#7ec87e]/10 text-[#5fad5f]";
  if (roi >= -50) return "bg-[#c87e2a]/10 text-[#c87e2a]";
  return "bg-danger/10 text-danger";
}

function profitColor(profit: number): string {
  if (profit > 0) return "text-[#2aaa56]";
  if (profit < 0) return "text-danger";
  return "text-muted";
}

function roiRowBg(roi: number): string {
  if (roi >= 200) return "bg-[#1a7a3a]/8";
  if (roi >= 100) return "bg-[#2aaa56]/6";
  if (roi >= 50)  return "bg-[#7ec87e]/4";
  if (roi >= 0)   return "";
  if (roi >= -50) return "bg-[#c87e2a]/4";
  return "bg-danger/5";
}

function Pct({ value }: { value: number }) {
  const cls = value >= 0 ? "text-[#2aaa56]" : "text-danger";
  return <span className={cls}>{value >= 0 ? "+" : ""}{value.toFixed(1)}%</span>;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="text-muted opacity-30">↕</span>;
  return <span className="text-brand-300">{dir === "asc" ? "↑" : "↓"}</span>;
}

interface Props {
  rows: ReportRow[];
  totalKomisi: number;
  totalSpend: number;
  isEstimated: boolean;
}

export function ReportsTable({ rows, totalKomisi, totalSpend, isEstimated }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === "string"
      ? av.localeCompare(bv as string)
      : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalProfit = totalKomisi - totalSpend;
  const totalRoas = totalSpend > 0 ? totalKomisi / totalSpend : 0;
  const totalRoi = totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;
  const totalKlikMeta = rows.reduce((s, r) => s + r.klikMeta, 0);
  const totalKlikMasuk = rows.reduce((s, r) => s + r.klikMasuk, 0);
  const totalPesanan = rows.reduce((s, r) => s + r.pesanan, 0);

  function Th({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
    return (
      <th
        className={`px-3 py-2 font-medium cursor-pointer select-none hover:text-ink whitespace-nowrap ${right ? "text-right" : ""}`}
        onClick={() => handleSort(k)}
      >
        {label} <SortIcon active={sortKey === k} dir={sortDir} />
      </th>
    );
  }

  return (
    <div>
      {isEstimated && (
        <div className="mb-3 rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-xs text-ink-2">
          ⚠ Komisi, Pesanan, ROAS, dan Profit per kampanye dihitung secara proporsional
          berdasarkan proporsi Klik Meta masing-masing kampanye terhadap total.
          Data komisi aktual tidak terikat per kampanye di sistem saat ini.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl2 border border-border bg-surface-2">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-muted border-b border-border">
            <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:font-medium">
              <Th k="campaign" label="Nama Iklan" />
              <Th k="spend" label="Ad Spend" right />
              <Th k="komisi" label="Komisi*" right />
              <Th k="klikMeta" label="Klik Meta" right />
              <Th k="klikMasuk" label="Klik Masuk" right />
              <Th k="pesanan" label="Pesanan*" right />
              <Th k="cpcMeta" label="CPC Meta" right />
              <Th k="cpcMasuk" label="CPC Masuk" right />
              <Th k="komisiPerKlikMasuk" label="Kom/Klik" right />
              <Th k="profit" label="Profit/Loss*" right />
              <Th k="roas" label="ROAS*" right />
              <Th k="roi" label="ROI*" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.campaign}
                className={`border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-2.5 ${roiRowBg(row.roi)}`}
              >
                <td className="font-medium text-ink max-w-[180px]">
                  <span className="block truncate" title={row.campaign}>
                    <span className="mr-2 text-muted">{i + 1}</span>
                    {row.campaign}
                  </span>
                </td>
                <td className="text-right text-ink-2">{formatCurrency(row.spend)}</td>
                <td className="text-right text-ink-2">{formatCurrency(row.komisi)}</td>
                <td className="text-right text-ink-2">{formatNumber(row.klikMeta)}</td>
                <td className="text-right text-ink-2">{formatNumber(row.klikMasuk)}</td>
                <td className="text-right text-ink-2">{formatNumber(row.pesanan)}</td>
                <td className="text-right text-ink-2">{formatCurrency(row.cpcMeta)}</td>
                <td className="text-right text-ink-2">{formatCurrency(row.cpcMasuk)}</td>
                <td className="text-right text-ink-2">{formatCurrency(row.komisiPerKlikMasuk)}</td>
                <td className={`text-right font-semibold ${profitColor(row.profit)}`}>
                  {row.profit >= 0 ? "" : "−"}{formatCurrency(Math.abs(row.profit))}
                </td>
                <td className="text-right">
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${roiColor(row.roi)}`}>
                    {row.roas.toFixed(1)}x
                  </span>
                </td>
                <td className="text-right">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${roiColor(row.roi)}`}>
                    {row.roi >= 0 ? "+" : ""}{row.roi.toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-border text-xs font-semibold text-ink">
            <tr className="[&>td]:px-3 [&>td]:py-2.5 bg-surface-3/50">
              <td>TOTAL ({rows.length} kampanye)</td>
              <td className="text-right">{formatCurrency(totalSpend)}</td>
              <td className="text-right">{formatCurrency(totalKomisi)}</td>
              <td className="text-right">{formatNumber(totalKlikMeta)}</td>
              <td className="text-right">{formatNumber(totalKlikMasuk)}</td>
              <td className="text-right">{formatNumber(totalPesanan)}</td>
              <td className="text-right">{formatCurrency(totalKlikMeta > 0 ? totalSpend / totalKlikMeta : 0)}</td>
              <td className="text-right">{formatCurrency(totalKlikMasuk > 0 ? totalSpend / totalKlikMasuk : 0)}</td>
              <td className="text-right">{formatCurrency(totalKlikMasuk > 0 ? totalKomisi / totalKlikMasuk : 0)}</td>
              <td className={`text-right ${profitColor(totalProfit)}`}>
                {totalProfit >= 0 ? "" : "−"}{formatCurrency(Math.abs(totalProfit))}
              </td>
              <td className="text-right">{totalRoas.toFixed(1)}x</td>
              <td className={`text-right ${profitColor(totalProfit)}`}>
                {totalRoi >= 0 ? "+" : ""}{totalRoi.toFixed(0)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
