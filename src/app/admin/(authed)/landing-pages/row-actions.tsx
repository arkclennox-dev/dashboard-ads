"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface RowActionsProps {
  id: string;
  status: "draft" | "published" | "archived";
}

export function LandingPageRowActions({ id, status }: RowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const path = status === "published" ? "unpublish" : "publish";
      const res = await fetch(`/api/landing-pages/${id}/${path}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      alert(`Failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2 hover:bg-surface-3 disabled:opacity-60"
    >
      {busy ? "…" : status === "published" ? "Unpublish" : "Publish"}
    </button>
  );
}
