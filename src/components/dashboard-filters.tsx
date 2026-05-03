"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AdSetRow } from "@/lib/reports";
import {
  IconCalendar,
  IconChevronDown,
  IconDownload,
  IconFilter,
  IconRefresh,
  IconSearch,
} from "./icons";

interface DashboardFiltersProps {
  from: string;
  to: string;
  search: string;
  onSearchChange: (v: string) => void;
  rows: AdSetRow[];
}

function formatDisplay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoStartOfMonth(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset, 1);
  return d.toISOString().slice(0, 10);
}

function isoEndOfMonth(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset + 1, 0);
  return d.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: "7D", from: () => isoOffset(-6), to: isoToday },
  { label: "14D", from: () => isoOffset(-13), to: isoToday },
  { label: "30D", from: () => isoOffset(-29), to: isoToday },
  { label: "This month", from: () => isoStartOfMonth(0), to: () => isoEndOfMonth(0) },
  { label: "Last month", from: () => isoStartOfMonth(-1), to: () => isoEndOfMonth(-1) },
];

function exportCsv(rows: AdSetRow[], from: string, to: string) {
  const header = "Ad Set Name,Status,Spend,Impressions,Clicks,CPC,CTR (%),Conversion Rate (%),ROAS";
  const lines = rows.map((r) =>
    [
      `"${r.ad_set_name.replace(/"/g, '""')}"`,
      r.status,
      r.spend.toFixed(2),
      r.impressions,
      r.clicks,
      r.cpc.toFixed(2),
      r.ctr.toFixed(2),
      r.conversion_rate.toFixed(2),
      r.roas.toFixed(2),
    ].join(","),
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ad-sets-${from}-${to}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DashboardFilters({
  from,
  to,
  search,
  onSearchChange,
  rows,
}: DashboardFiltersProps) {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);
  const [refreshing, setRefreshing] = useState(false);

  const applyRange = useCallback(
    (newFrom: string, newTo: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("from", newFrom);
      params.set("to", newTo);
      router.push(`?${params.toString()}`);
      setShowDatePicker(false);
    },
    [router],
  );

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1200);
  }

  const activePreset = PRESETS.find(
    (p) => p.from() === from && p.to() === to,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date range button */}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-3"
        >
          <IconCalendar width={15} height={15} />
          {formatDisplay(from)} – {formatDisplay(to)}
          <IconChevronDown width={14} height={14} />
        </button>

        {showDatePicker && (
          <div className="absolute left-0 top-full z-50 mt-1 w-[340px] rounded-xl border border-border bg-surface-2 p-4 shadow-lg">
            {/* Presets */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyRange(p.from(), p.to())}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    activePreset?.label === p.label
                      ? "bg-brand text-white"
                      : "border border-border bg-surface text-ink-2 hover:bg-surface-3"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mb-3 border-t border-border pt-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                Custom range
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
                <span className="text-xs text-muted">–</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={isoToday()}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDatePicker(false)}
                className="rounded-md px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-3"
              >
                Cancel
              </button>
              <button
                onClick={() => applyRange(customFrom, customTo)}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative min-w-[240px] flex-1">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width={15} height={15} />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search ad sets..."
          className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none"
        />
      </div>

      {/* Spacer */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className={`rounded-lg border border-border bg-surface-2 p-2 text-ink-2 hover:bg-surface-3 ${refreshing ? "animate-spin" : ""}`}
          aria-label="Refresh"
          title="Refresh data"
        >
          <IconRefresh width={16} height={16} />
        </button>

        {/* Export CSV */}
        <button
          onClick={() => exportCsv(rows, from, to)}
          className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-600"
          title="Export ad sets as CSV"
        >
          <IconDownload width={15} height={15} /> Export
        </button>
      </div>
    </div>
  );
}
