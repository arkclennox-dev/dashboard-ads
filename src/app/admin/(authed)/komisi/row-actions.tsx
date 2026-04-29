"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function KomisiRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Hapus data komisi ini?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/commissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      alert(`Gagal: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="rounded-md border border-danger/40 bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-60"
    >
      {busy ? "…" : "Hapus"}
    </button>
  );
}
