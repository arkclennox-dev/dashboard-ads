"use client";

import { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/format";

export interface ReportRow {
  campaign: string;
  spend: number;
  klikMeta: number;
  klikMasuk: number;
  cpcMeta: number;
  cpcMasuk: number;
}

type SortKey = keyof ReportRow;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="opacity-20">↕</span>;
  return <span className="text-brand-300">{dir === "asc" ? "↑" : "↓"}</span>;
}

function KlikMasukCell({ campaign, initial }: { campaign: string; initial: number }) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(initial));
  const [saving, setSaving] = useState(false);

  async function save() {
    const n = parseInt(draft, 10);
    if (isNaN(n) || n < 0) { setDraft(String(value)); setEditing(false); return; }
    setSaving(true);
    try {
      await fetch("/api/reports/klik-masuk", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ utm_campaign: campaign, klik_masuk: n }),
      });
      setValue(n);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-1">
        <input
          autoFocus
          type="number"
          min={0}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setDraft(String(value)); setEditing(false); } }}
          className="w-24 rounded border border-brand bg-surface px-2 py-0.5 text-right text-sm focus:outline-none"
        />
        <button onClick={save} disabled={saving} className="text-xs text-brand-300 hover:underline disabled:opacity-50">
          {saving ? "…" : "OK"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="group flex w-full items-center justify-end gap-1.5 text-right"
      title="Klik untuk edit"
    >
      <span>{formatNumber(value)}</span>
      <span className="opacity-0 group-hover:opacity-60 text-[10px] text-muted">✏</span>
    </button>
  );
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
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalKlikMeta = rows.reduce((s, r) => s + r.klikMeta, 0);
  const totalKlikMasuk = rows.reduce((s, r) => s + r.klikMasuk, 0);
  const totalProfit = totalKomisi - totalSpend;

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
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-muted border-b border-border">
          <tr className="[&>th]:px-3 [&>th]:py-2.5">
            <Th k="campaign" label="Nama Iklan" />
            <Th k="spend" label="Ad Spend" right />
            <Th k="klikMeta" label="Klik Meta" right />
            <th className="px-3 py-2.5 text-right whitespace-nowrap text-brand-300/80">
              Klik Masuk ✏
            </th>
            <Th k="cpcMeta" label="CPC Meta" right />
            <Th k="cpcMasuk" label="CPC Masuk" right />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                Belum ada data. Upload ad spend report terlebih dahulu.
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr key={row.campaign} className="border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-2.5">
                <td className="max-w-[220px]">
                  <span className="flex items-center gap-2">
                    <span className="text-muted text-xs">{i + 1}</span>
                    <span className="truncate font-medium text-ink" title={row.campaign}>{row.campaign}</span>
                  </span>
                </td>
                <td className="text-right text-ink-2">{formatCurrency(row.spend)}</td>
                <td className="text-right text-ink-2">{formatNumber(row.klikMeta)}</td>
                <td className="text-right">
                  <KlikMasukCell campaign={row.campaign} initial={row.klikMasuk} />
                </td>
                <td className="text-right text-ink-2">{formatCurrency(row.cpcMeta)}</td>
                <td className="text-right text-ink-2">
                  {row.klikMasuk > 0 ? formatCurrency(row.cpcMasuk) : <span className="text-muted">—</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="border-t-2 border-border">
          <tr className="bg-surface-3/50 text-xs font-semibold text-ink [&>td]:px-3 [&>td]:py-2.5">
            <td>TOTAL ({rows.length} kampanye)</td>
            <td className="text-right">{formatCurrency(totalSpend)}</td>
            <td className="text-right">{formatNumber(totalKlikMeta)}</td>
            <td className="text-right">{formatNumber(totalKlikMasuk)}</td>
            <td className="text-right">{formatCurrency(totalKlikMeta > 0 ? totalSpend / totalKlikMeta : 0)}</td>
            <td className="text-right">{formatCurrency(totalKlikMasuk > 0 ? totalSpend / totalKlikMasuk : 0)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Global summary */}
      <div className="border-t border-border px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <span>Total Komisi (global): <strong className="text-ink">{formatCurrency(totalKomisi)}</strong></span>
        <span>Profit/Loss: <strong className={totalProfit >= 0 ? "text-[#2aaa56]" : "text-danger"}>{totalProfit >= 0 ? "" : "−"}{formatCurrency(Math.abs(totalProfit))}</strong></span>
        <span>ROAS: <strong className="text-ink">{totalSpend > 0 ? `${(totalKomisi / totalSpend).toFixed(2)}x` : "—"}</strong></span>
      </div>
    </div>
  );
}
