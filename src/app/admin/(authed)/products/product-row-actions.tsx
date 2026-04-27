"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductRowActionsProps {
  id: string;
  title: string;
  status: "active" | "inactive";
}

export function ProductRowActions({ id, title, status }: ProductRowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "toggle" | "delete">(null);

  async function toggleStatus() {
    setBusy("toggle");
    try {
      const next = status === "active" ? "inactive" : "active";
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      alert(`Failed: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!confirm(`Delete "${title}"? This soft-deletes (sets inactive).`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      alert(`Failed: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={toggleStatus}
        disabled={busy !== null}
        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2 hover:bg-surface-3 disabled:opacity-60"
      >
        {busy === "toggle"
          ? "…"
          : status === "active"
            ? "Deactivate"
            : "Activate"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy !== null}
        className="rounded-md border border-danger/40 bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-60"
      >
        {busy === "delete" ? "…" : "Delete"}
      </button>
    </div>
  );
}
