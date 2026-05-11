"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ParsedRow {
  report_date: string;
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  spend: number;
  impressions: number;
  link_clicks: number;
  landing_page_views: number;
}

// Flexible column name mapping (lowercase, trimmed)
// Supports both English (Meta Ads Manager) and Indonesian (Meta Ads Manager ID) exports
const COL_DATE = ["day", "date", "tanggal", "reporting starts", "report_date", "awal pelaporan"];
const COL_CAMPAIGN = ["campaign name", "campaign_name", "campaign", "nama kampanye"];
const COL_ADSET = ["ad set name", "adset_name", "adset name", "ad set", "nama ad set"];
const COL_AD = ["ad name", "ad_name", "ad", "nama iklan"];
const COL_SPEND = [
  "amount spent", "spend", "biaya",
  "amount spent (idr)", "amount spent (usd)",
  "jumlah yang dibelanjakan (idr)", "jumlah yang dibelanjakan (usd)", "jumlah yang dibelanjakan",
];
const COL_IMPRESSIONS = ["impressions", "impr.", "impr", "impresi"];
const COL_LINK_CLICKS = ["link clicks", "link_clicks", "clicks"];
const COL_LPV = ["landing page views", "landing_page_views", "lpv"];
// Indonesian export: "Hasil" = results (link clicks when "Indikator Hasil" = actions:link_click)
const COL_HASIL = ["hasil"];
const COL_INDIKATOR = ["indikator hasil", "result indicator"];

function findCol(headers: string[], candidates: string[]): number {
  return headers.findIndex((h) => candidates.includes(h.toLowerCase().trim()));
}

function parseAmount(v: string): number {
  // Remove currency symbols, spaces, dots (thousand sep), then parse
  return Number(v.replace(/[^0-9,.-]/g, "").replace(/,/g, ".")) || 0;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuote && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
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

async function parseFile(file: File): Promise<ParsedRow[]> {
  const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

  let rawRows: string[][];

  if (isXlsx) {
    const { read, utils } = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rawRows = utils.sheet_to_csv(ws).split("\n").map((r) => r.split(","));
  } else {
    const text = await file.text();
    rawRows = parseCSV(text);
  }

  if (rawRows.length < 2) throw new Error("File terlalu sedikit baris.");

  const headers = rawRows[0];
  const iDate = findCol(headers, COL_DATE);
  const iCamp = findCol(headers, COL_CAMPAIGN);
  const iAdset = findCol(headers, COL_ADSET);
  const iAd = findCol(headers, COL_AD);
  const iSpend = findCol(headers, COL_SPEND);
  const iImpr = findCol(headers, COL_IMPRESSIONS);
  const iLC = findCol(headers, COL_LINK_CLICKS);
  const iLPV = findCol(headers, COL_LPV);
  // Indonesian export: "Hasil" = generic results; "Indikator Hasil" tells us which metric
  const iHasil = findCol(headers, COL_HASIL);
  const iIndikator = findCol(headers, COL_INDIKATOR);

  if (iDate < 0 || iCamp < 0) {
    const found = headers.map((h) => `"${h.trim()}"`).join(", ");
    throw new Error(
      `Kolom wajib tidak ditemukan. Kolom terdeteksi: ${found}. ` +
      `Pastikan ada kolom tanggal ("Awal pelaporan"/"Day") dan kampanye ("Nama kampanye"/"Campaign Name").`,
    );
  }

  const results: ParsedRow[] = [];
  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    const dateVal = r[iDate]?.trim();
    const campVal = r[iCamp]?.trim();
    if (!dateVal || !campVal) continue;

    // Normalize date — supports YYYY-MM-DD and MM/DD/YYYY
    let reportDate = dateVal;
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateVal)) {
      const [m, d, y] = dateVal.split("/");
      reportDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // Resolve link clicks: prefer explicit column, fall back to "Hasil" when
    // "Indikator Hasil" confirms it measures link clicks
    let linkClicks = iLC >= 0 ? Number(r[iLC]?.replace(/,/g, "") ?? "0") || 0 : 0;
    if (linkClicks === 0 && iHasil >= 0) {
      const isLinkClick =
        iIndikator < 0 ||
        (r[iIndikator]?.toLowerCase().includes("link_click") ?? false);
      if (isLinkClick) {
        linkClicks = Number(r[iHasil]?.replace(/,/g, "") ?? "0") || 0;
      }
    }

    results.push({
      report_date: reportDate,
      campaign_name: campVal,
      adset_name: iAdset >= 0 ? r[iAdset]?.trim() ?? "" : "",
      ad_name: iAd >= 0 ? r[iAd]?.trim() ?? "" : "",
      spend: iSpend >= 0 ? parseAmount(r[iSpend] ?? "0") : 0,
      impressions: iImpr >= 0 ? Number(r[iImpr]?.replace(/,/g, "") ?? "0") || 0 : 0,
      link_clicks: linkClicks,
      landing_page_views: iLPV >= 0 ? Number(r[iLPV]?.replace(/,/g, "") ?? "0") || 0 : 0,
    });
  }
  return results;
}

export function AdSpendCsvImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; failed: number } | null>(null);

  async function handleFile(file: File) {
    setParseError(null);
    setPreview(null);
    setResult(null);
    try {
      const rows = await parseFile(file);
      setPreview(rows);
    } catch (err) {
      setParseError((err as Error).message);
    }
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    let ok = 0;
    let failed = 0;
    for (const row of preview) {
      try {
        const res = await fetch("/api/ad-spend", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...row, platform: "meta" }),
        });
        if (res.ok) ok++;
        else failed++;
      } catch {
        failed++;
      }
    }
    setResult({ ok, failed });
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
    setImporting(false);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Upload file ekspor dari Meta Ads Manager (CSV atau XLSX). Kolom yang dikenali:{" "}
        <span className="font-mono">Day, Campaign Name, Ad Set Name, Ad Name, Amount Spent, Impressions, Link Clicks, Landing Page Views</span>.
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
          <div className="mt-1 text-xs text-muted">.csv atau .xlsx</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
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

      {result && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-xs text-success">
          Import selesai: {result.ok} baris berhasil{result.failed > 0 ? `, ${result.failed} gagal` : ""}.
        </div>
      )}

      {preview && preview.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-2">{preview.length} baris siap diimport</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-3"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {importing ? "Mengimport…" : `Import ${preview.length} baris`}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-border bg-surface-3 text-muted">
                <tr className="[&>th]:px-3 [&>th]:py-2">
                  <th>Tanggal</th>
                  <th>Campaign</th>
                  <th>Ad Set</th>
                  <th>Spend</th>
                  <th>Impr.</th>
                  <th>Klik</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-2">
                    <td>{r.report_date}</td>
                    <td className="max-w-[180px] truncate">{r.campaign_name}</td>
                    <td className="max-w-[140px] truncate">{r.adset_name || "—"}</td>
                    <td>{r.spend.toLocaleString("id-ID")}</td>
                    <td>{r.impressions.toLocaleString("id-ID")}</td>
                    <td>{r.link_clicks.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-2 text-center text-muted">
                      + {preview.length - 10} baris lainnya
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
