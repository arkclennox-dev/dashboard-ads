"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MetaAdAccount } from "@/lib/types";

export function MetaAccountsClient({ initialAccounts }: { initialAccounts: MetaAdAccount[] }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<MetaAdAccount[]>(initialAccounts);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  async function handleAdd() {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/meta/accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, ad_account_id: adAccountId, access_token: accessToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Gagal menyimpan");
      setAccounts((prev) => [...prev, json.data]);
      setName("");
      setAdAccountId("");
      setAccessToken("");
      setShowForm(false);
      router.refresh();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(account: MetaAdAccount) {
    const res = await fetch(`/api/meta/accounts/${account.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_active: !account.is_active }),
    });
    if (res.ok) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, is_active: !a.is_active } : a)),
      );
    }
  }

  async function handleDelete(account: MetaAdAccount) {
    if (!confirm(`Hapus akun "${account.name}"? Data spend yang sudah disync tidak akan terhapus.`)) return;
    const res = await fetch(`/api/meta/accounts/${account.id}`, { method: "DELETE" });
    if (res.ok) {
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Account list */}
      <div className="rounded-xl2 border border-border bg-surface-2">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Akun terdaftar</h2>
            <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
              {accounts.length}
            </span>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setFormError(null); }}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90 transition"
          >
            {showForm ? "Batal" : "+ Tambah Akun"}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="border-t border-border px-4 py-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted">Nama akun</label>
                <input
                  type="text"
                  placeholder="cth: Toko Utama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Ad Account ID</label>
                <input
                  type="text"
                  placeholder="act_123456789"
                  value={adAccountId}
                  onChange={(e) => setAdAccountId(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Access Token</label>
              <input
                type="password"
                placeholder="EAAxxxxxxx..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            {formError && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                {formError}
              </p>
            )}
            <button
              onClick={handleAdd}
              disabled={saving || !name || !adAccountId || !accessToken}
              className="rounded-md bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Menyimpan…" : "Simpan Akun"}
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-y border-border [&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                <th>Nama</th>
                <th>Ad Account ID</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                    Belum ada akun. Klik &quot;+ Tambah Akun&quot; untuk mulai.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-border last:border-0 [&>td]:px-4 [&>td]:py-3"
                  >
                    <td className="font-medium text-ink">{account.name}</td>
                    <td className="font-mono text-xs text-ink-2">{account.ad_account_id}</td>
                    <td>
                      <button
                        onClick={() => handleToggle(account)}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                          account.is_active
                            ? "bg-success/15 text-success hover:bg-success/25"
                            : "bg-surface-3 text-muted hover:bg-surface-3/80"
                        }`}
                      >
                        {account.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="text-xs text-ink-2">
                      {account.created_at ? new Date(account.created_at).toLocaleDateString("id-ID") : "—"}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(account)}
                        className="text-xs text-danger hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-xs text-muted space-y-1">
        <p><strong className="text-ink">Token</strong> — dapatkan dari Meta Business Manager → Pengguna sistem → Generate token baru (permission: <code className="font-mono">ads_read</code>).</p>
        <p><strong className="text-ink">Ad Account ID</strong> — format <code className="font-mono">act_XXXXXXXXXX</code>, ada di URL Ads Manager.</p>
        <p><strong className="text-ink">Sync</strong> — pergi ke halaman <a href="/admin/ad-spend" className="text-brand hover:underline">Biaya Iklan</a> untuk menjalankan sync. Semua akun aktif akan disync sekaligus.</p>
      </div>
    </div>
  );
}
