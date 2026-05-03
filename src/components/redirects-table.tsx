"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/format";
import { IconEdit, IconTrash } from "./icons";

interface RedirectRow {
  id: string;
  title: string;
  slug: string;
  short_code?: string | null;
  destination_url: string;
  total_clicks: number;
}

interface RedirectsTableProps {
  items: RedirectRow[];
}

export function RedirectsTable({ items: initItems }: RedirectsTableProps) {
  const router = useRouter();
  const [items, setItems] = useState(initItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(row: RedirectRow) {
    setEditingId(row.id);
    setEditUrl(row.destination_url);
    setEditTitle(row.title);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ destination_url: editUrl, title: editTitle }),
      });
      const json = await res.json() as { success: boolean; data?: RedirectRow; error?: { message: string } };
      if (!res.ok || !json.success) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, destination_url: editUrl, title: editTitle }
            : p,
        ),
      );
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}?hard=true`, { method: "DELETE" });
      const json = await res.json() as { success: boolean; error?: { message: string } };
      if (!res.ok || !json.success) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-border bg-surface-2">
      <div className="flex items-center gap-3 px-4 py-3">
        <h2 className="text-sm font-semibold">Redirect URLs</h2>
        <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
          {items.length} produk
        </span>
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-muted">
            <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
              <th>Produk</th>
              <th>Redirect URL</th>
              <th>Destination</th>
              <th>Klik</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted">
                  Belum ada redirect. Buat lewat widget di sebelah kanan.
                </td>
              </tr>
            )}
            {items.map((row) => {
              const isEditing = editingId === row.id;
              const isConfirmDelete = confirmDeleteId === row.id;
              const redirectPath = row.short_code ? `/${row.short_code}` : `/${row.slug}`;

              return (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-2.5"
                >
                  {/* Produk name */}
                  <td className="font-medium text-ink">
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                    ) : (
                      row.title
                    )}
                  </td>

                  {/* Redirect URL */}
                  <td>
                    <code className="rounded bg-surface px-2 py-1 text-xs text-brand-300">
                      {redirectPath}
                    </code>
                  </td>

                  {/* Destination */}
                  <td className="max-w-[280px]">
                    {isEditing ? (
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
                        placeholder="https://s.shopee.co.id/..."
                      />
                    ) : (
                      <span className="truncate block text-ink-2">{row.destination_url}</span>
                    )}
                  </td>

                  {/* Clicks */}
                  <td className="text-ink-2">{formatNumber(row.total_clicks)}</td>

                  {/* Actions */}
                  <td className="text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => saveEdit(row.id)}
                          disabled={saving || !editUrl}
                          className="rounded-md bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                          {saving ? "..." : "Simpan"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-ink-2 hover:bg-surface-3"
                        >
                          Batal
                        </button>
                      </div>
                    ) : isConfirmDelete ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-muted">Hapus?</span>
                        <button
                          onClick={() => confirmDelete(row.id)}
                          disabled={deleting}
                          className="rounded-md bg-danger px-2.5 py-1 text-xs font-semibold text-white hover:bg-danger/80 disabled:opacity-50"
                        >
                          {deleting ? "..." : "Ya"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-ink-2 hover:bg-surface-3"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(row)}
                          className="rounded p-1.5 text-muted hover:bg-surface-3 hover:text-ink"
                          title="Edit destination"
                        >
                          <IconEdit width={15} height={15} />
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteId(row.id); setError(null); }}
                          className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                          title="Hapus"
                        >
                          <IconTrash width={15} height={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
