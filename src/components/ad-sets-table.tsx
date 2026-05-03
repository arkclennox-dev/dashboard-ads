"use client";

import { useState, useMemo } from "react";
import type { AdSetRow } from "@/lib/reports";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronLeft,
  IconChevronRight,
} from "./icons";

interface AdSetsTableProps {
  rows: AdSetRow[];
  search?: string;
}

type SortKey = keyof Pick<
  AdSetRow,
  "ad_set_name" | "spend" | "impressions" | "clicks" | "cpc" | "ctr" | "conversion_rate" | "roas"
>;

const PAGE_SIZE = 8;

const statusStyles: Record<AdSetRow["status"], string> = {
  Active: "bg-success/10 text-success",
  Paused: "bg-warn/15 text-warn",
  Inactive: "bg-muted-2/15 text-muted",
};

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: "asc" | "desc" }) {
  if (col !== sortKey) return <span className="opacity-30"><IconArrowDown width={11} height={11} /></span>;
  return sortDir === "asc"
    ? <IconArrowUp width={11} height={11} className="text-brand" />
    : <IconArrowDown width={11} height={11} className="text-brand" />;
}

export function AdSetsTable({ rows, search = "" }: AdSetsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? rows.filter((r) => r.ad_set_name.toLowerCase().includes(q)) : rows;
  }, [rows, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleSort(col: SortKey) {
    if (col === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("desc");
    }
    setPage(1);
  }

  function toggleAll() {
    if (selected.size === visible.length && visible.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((r) => r.id)));
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allChecked = visible.length > 0 && visible.every((r) => selected.has(r.id));

  const SortTh = ({
    col,
    children,
    className,
  }: {
    col: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => (
    <th className={className}>
      <button
        onClick={() => toggleSort(col)}
        className="inline-flex items-center gap-1 hover:text-ink"
      >
        {children}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </button>
    </th>
  );

  return (
    <div className="rounded-xl2 border border-border bg-surface-2">
      <div className="flex items-center gap-3 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Ad Sets Performance</h2>
        <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
          {filtered.length} Ad Sets
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-muted">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium border-y border-border">
              <th>
                <input
                  type="checkbox"
                  className="accent-brand"
                  aria-label="Select all"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <SortTh col="ad_set_name">Ad Set Name</SortTh>
              <th>Status</th>
              <SortTh col="spend">Spend</SortTh>
              <SortTh col="impressions">Impressions</SortTh>
              <SortTh col="clicks">Clicks</SortTh>
              <SortTh col="cpc">CPC</SortTh>
              <SortTh col="ctr">CTR</SortTh>
              <SortTh col="conversion_rate">Conversion Rate</SortTh>
              <SortTh col="roas">ROAS</SortTh>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-sm text-muted">
                  No ad sets found{search ? ` for "${search}"` : ""}.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr
                  key={row.id}
                  className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                >
                  <td>
                    <input
                      type="checkbox"
                      className="accent-brand"
                      aria-label={`Select ${row.ad_set_name}`}
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td className="font-medium text-ink">{row.ad_set_name}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="text-ink-2">{formatCurrency(row.spend)}</td>
                  <td className="text-ink-2">{formatNumber(row.impressions)}</td>
                  <td className="text-ink-2">{formatNumber(row.clicks)}</td>
                  <td className="text-ink-2">{formatCurrency(row.cpc)}</td>
                  <td className="text-ink-2">{formatPercent(row.ctr)}</td>
                  <td className="text-ink-2">{formatPercent(row.conversion_rate)}</td>
                  <td className="text-ink-2">{row.roas.toFixed(2)}</td>
                  <td className="text-right">
                    <span className="text-xs text-muted">—</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
        <span>
          Showing {sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
          {Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length} results
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-ink disabled:opacity-40"
              aria-label="Previous page"
            >
              <IconChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-md ${
                  p === safePage
                    ? "bg-brand text-white"
                    : "border border-border bg-surface text-ink-2 hover:text-ink"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-ink disabled:opacity-40"
              aria-label="Next page"
            >
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
