"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface RowActionsProps {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
}

export function LandingPageRowActions({ id, title, status }: RowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "toggle" | "delete">(null);

  async function toggle() {
    setBusy("toggle");
    try {
      const path = status === "published" ? "unpublish" : "publish";
      const res = await fetch(`/api/landing-pages/${id}/${path}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      alert(`Gagal: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!confirm(`Hapus landing page "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/landing-pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      alert(`Gagal: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy !== null}
        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2 hover:bg-surface-3 disabled:opacity-60"
      >
        {busy === "toggle" ? "…" : status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy !== null}
        className="rounded-md border border-danger/40 bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-60"
      >
        {busy === "delete" ? "…" : "Hapus"}
      </button>
    </div>
  );
}
