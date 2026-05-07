"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface AggRow {
  tag_link: string;
  campaign_key: string;
  perujuk: string;
  report_date: string;
  klik_count: number;
}

function detectSep(firstLine: string): string {
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis = (firstLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function parseCSV(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuote && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === sep && !inQuote) {
      row.push(cell); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuote) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function stripSuffix(tagLink: string): string {
  return tagLink.replace(/-+$/, "").trim();
}

function parseShopeeCSV(text: string): AggRow[] {
  const firstLine = text.split("\n")[0];
  const sep = detectSep(firstLine);
  const rawRows = parseCSV(text, sep);
  if (rawRows.length < 2) throw new Error("File terlalu sedikit baris.");

  const headers = rawRows[0].map((h) => h.toLowerCase().trim());
  const iTag = headers.findIndex((h) => h === "tag_link" || h === "tag link");
  const iRef = headers.findIndex((h) => h === "perujuk" || h === "referrer" || h === "source");
  const iTime = headers.findIndex(
    (h) => h.includes("waktu") || h.includes("time") || h.includes("tanggal"),
  );

  if (iTag < 0)
    throw new Error('Kolom "Tag_link" tidak ditemukan. Pastikan ini adalah file laporan klik Shopee Affiliate.');
  if (iRef < 0)
    throw new Error('Kolom "Perujuk" tidak ditemukan.');

  const agg = new Map<string, AggRow>();

  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    const tagLink = r[iTag]?.trim();
    const perujuk = r[iRef]?.trim();
    if (!tagLink || !perujuk) continue;

    const campaignKey = stripSuffix(tagLink);

    let reportDate = "2000-01-01";
    if (iTime >= 0) {
      const timeStr = r[iTime]?.trim() ?? "";
      const match = timeStr.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) reportDate = match[1];
    }

    const key = `${tagLink}|${perujuk}|${reportDate}`;
    const prev = agg.get(key);
    if (prev) {
      prev.klik_count++;
    } else {
      agg.set(key, { tag_link: tagLink, campaign_key: campaignKey, perujuk, report_date: reportDate, klik_count: 1 });
    }
  }

  if (agg.size === 0) throw new Error("Tidak ada data klik yang valid ditemukan.");
  return Array.from(agg.values());
}

export function ShopeeCsvImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<AggRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number } | null>(null);

  async function handleFile(file: File) {
    setParseError(null);
    setPreview(null);
    setResult(null);
    try {
      const text = await file.text();
      const rows = parseShopeeCSV(text);
      setPreview(rows);
    } catch (err) {
      setParseError((err as Error).message);
    }
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    try {
      const res = await fetch("/api/shopee-clicks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows: preview }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: data.data?.imported ?? preview.length });
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        setParseError(data.message ?? "Import gagal.");
      }
    } finally {
      setImporting(false);
    }
  }

  const totalKlik = preview?.reduce((s, r) => s + r.klik_count, 0) ?? 0;
  const uniqueCampaigns = preview ? new Set(preview.map((r) => r.campaign_key)).size : 0;

  return (
    <div className="rounded-xl2 border border-border bg-surface-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink hover:bg-surface-3/40"
      >
        <span>Upload Laporan Klik Shopee</span>
        <span className="text-muted text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          <p className="text-xs text-muted">
            Upload file ekspor dari Shopee Affiliate (CSV). Kolom yang dibutuhkan:{" "}
            <span className="font-mono">Tag_link, Perujuk, Waktu Klik</span>. Data lama dengan
            tanggal yang sama akan ditimpa.
          </p>

          <div
            className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface py-6 hover:border-brand/50 hover:bg-brand/5 transition"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-ink-2">Drag & drop atau klik untuk pilih file</div>
              <div className="mt-1 text-xs text-muted">.csv</div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {parseError && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              {parseError}
            </div>
          )}

          {preview && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
                Ditemukan:{" "}
                <strong className="text-ink">{uniqueCampaigns} kampanye</strong>, total{" "}
                <strong className="text-ink">{totalKlik.toLocaleString()} klik</strong>
              </div>

              <div className="max-h-40 overflow-y-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-surface-2 text-muted">
                    <tr>
                      <th className="px-2 py-1 text-left">Campaign Key</th>
                      <th className="px-2 py-1 text-left">Perujuk</th>
                      <th className="px-2 py-1 text-right">Klik</th>
                      <th className="px-2 py-1 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1 font-mono">{r.campaign_key}</td>
                        <td className="px-2 py-1">{r.perujuk}</td>
                        <td className="px-2 py-1 text-right">{r.klik_count}</td>
                        <td className="px-2 py-1 text-muted">{r.report_date}</td>
                      </tr>
                    ))}
                    {preview.length > 50 && (
                      <tr className="border-t border-border">
                        <td colSpan={4} className="px-2 py-1 text-center text-muted">
                          +{preview.length - 50} baris lainnya
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
                >
                  {importing ? "Mengimpor…" : `Import ${totalKlik.toLocaleString()} klik`}
                </button>
                <button
                  onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
                  className="text-xs text-muted hover:text-ink"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-[#2aaa56]/40 bg-[#2aaa56]/10 px-3 py-2 text-xs text-[#2aaa56]">
              Data klik Shopee berhasil diimpor. Tabel di bawah sudah diperbarui.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
