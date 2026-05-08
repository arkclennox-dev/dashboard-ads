"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconCalendar, IconChevronDown } from "@/components/icons";

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

function formatDisplay(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PRESETS = [
  { label: "Hari ini", from: isoToday, to: isoToday },
  { label: "7 Hari", from: () => isoOffset(-6), to: isoToday },
  { label: "14 Hari", from: () => isoOffset(-13), to: isoToday },
  { label: "30 Hari", from: () => isoOffset(-29), to: isoToday },
  { label: "Bulan ini", from: () => isoStartOfMonth(0), to: () => isoEndOfMonth(0) },
  { label: "Bulan lalu", from: () => isoStartOfMonth(-1), to: () => isoEndOfMonth(-1) },
];

interface Props {
  from: string;
  to: string;
}

export function ReportsDateFilter({ from, to }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const applyRange = useCallback(
    (newFrom: string, newTo: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("from", newFrom);
      params.set("to", newTo);
      router.push(`?${params.toString()}`);
      setOpen(false);
    },
    [router],
  );

  const activePreset = PRESETS.find((p) => p.from() === from && p.to() === to);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-3"
      >
        <IconCalendar width={15} height={15} />
        <span>{formatDisplay(from)} – {formatDisplay(to)}</span>
        <IconChevronDown width={14} height={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-[320px] rounded-xl border border-border bg-surface-2 p-4 shadow-lg">
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

            <div className="border-t border-border pt-3">
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
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-3"
                >
                  Batal
                </button>
                <button
                  onClick={() => applyRange(customFrom, customTo)}
                  className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
