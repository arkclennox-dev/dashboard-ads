"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
    || `page-${Date.now()}`;
}

export function NewLandingPageButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), slug: slugify(title), status: "draft" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      router.push(`/landing-pages/${json.data.id}/edit`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
      >
        + New landing page
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") create(); if (e.key === "Escape") setOpen(false); }}
        placeholder="Nama halaman..."
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none w-52"
      />
      <button
        onClick={create}
        disabled={busy || !title.trim()}
        className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy ? "Membuat…" : "Buat"}
      </button>
      <button onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">Batal</button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
