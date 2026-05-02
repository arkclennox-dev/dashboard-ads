"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function defaultSince() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

function defaultUntil() {
  return new Date().toISOString().slice(0, 10);
}

export function MetaSync({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [since, setSince] = useState(defaultSince);
  const [until, setUntil] = useState(defaultUntil);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ synced: number; since: string; until: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/meta/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ since, until }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Sync gagal");
      }
      setResult(json.data);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
        <strong>Belum dikonfigurasi.</strong> Tambahkan{" "}
        <code className="font-mono">META_ACCESS_TOKEN</code> dan{" "}
        <code className="font-mono">META_AD_ACCOUNT_ID</code> ke environment variables untuk
        mengaktifkan fitur ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Tarik data spend, impressions, dan klik langsung dari Meta Ads Manager untuk rentang tanggal
        yang dipilih. Data lama untuk periode tersebut akan diganti.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">Dari</label>
          <input
            type="date"
            value={since}
            max={until}
            onChange={(e) => setSince(e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">Sampai</label>
          <input
            type="date"
            value={until}
            min={since}
            max={defaultUntil()}
            onChange={(e) => setUntil(e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <button
          onClick={handleSync}
          disabled={loading || !since || !until}
          className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Menyinkronkan…" : "Sync dari Meta"}
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-xs text-success">
          Berhasil menyinkronkan <strong>{result.synced}</strong> baris untuk periode{" "}
          {result.since} s/d {result.until}.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}
    </div>
  );
}
