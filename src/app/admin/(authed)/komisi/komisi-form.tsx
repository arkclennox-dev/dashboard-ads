"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function KomisiForm() {
  const router = useRouter();
  const [reportDate, setReportDate] = useState(todayIso());
  const [klik, setKlik] = useState("");
  const [pesanan, setPesanan] = useState("");
  const [komisi, setKomisi] = useState("");
  const [pembelian, setPembelian] = useState("");
  const [produkTerjual, setProdukTerjual] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body = {
        report_date: reportDate,
        klik: Number(klik) || 0,
        pesanan: Number(pesanan) || 0,
        komisi: Number(komisi) || 0,
        pembelian: Number(pembelian) || 0,
        produk_terjual: Number(produkTerjual) || 0,
        notes: notes || null,
      };
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as
        | { success: true }
        | { success: false; error: { message: string } };
      if (!res.ok || !json.success) {
        throw new Error(
          "error" in json && json.error?.message ? json.error.message : `HTTP ${res.status}`,
        );
      }
      setMsg({ type: "ok", text: "Data komisi berhasil disimpan." });
      setKlik("");
      setPesanan("");
      setKomisi("");
      setPembelian("");
      setProdukTerjual("");
      setNotes("");
      router.refresh();
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Tanggal</div>
        <input
          type="date"
          className={inputCls}
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Klik</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={klik}
          onChange={(e) => setKlik(e.target.value)}
          placeholder="0"
          required
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Pesanan</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={pesanan}
          onChange={(e) => setPesanan(e.target.value)}
          placeholder="0"
          required
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Komisi (Rp)</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={komisi}
          onChange={(e) => setKomisi(e.target.value)}
          placeholder="0"
          required
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Total Pembelian (Rp)</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={pembelian}
          onChange={(e) => setPembelian(e.target.value)}
          placeholder="0"
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Produk Terjual</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={produkTerjual}
          onChange={(e) => setProdukTerjual(e.target.value)}
          placeholder="0"
        />
      </label>
      <label className="block lg:col-span-6">
        <div className="mb-1 text-xs text-ink-2">Catatan (opsional)</div>
        <input
          className={inputCls}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan tambahan..."
        />
      </label>
      {msg && (
        <div
          className={`col-span-2 md:col-span-3 lg:col-span-6 rounded-lg border px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {msg.text}
        </div>
      )}
      <div className="col-span-2 md:col-span-3 lg:col-span-6">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Menyimpan…" : "Simpan data komisi"}
        </button>
      </div>
    </form>
  );
}
