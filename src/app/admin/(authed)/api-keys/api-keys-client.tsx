"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

const SCOPE_OPTIONS = [
  "read",
  "products:read",
  "products:write",
  "landing_pages:read",
  "landing_pages:write",
  "clicks:read",
  "clicks:write",
  "ad_spend:read",
  "ad_spend:write",
  "reports:read",
  "settings:read",
  "settings:write",
  "api_keys:manage",
] as const;

interface KeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  status: string;
  last_used_at: string | null;
  created_at: string;
}

export function ApiKeysClient({ initialKeys }: { initialKeys: KeyRow[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState<KeyRow[]>(initialKeys);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [busy, setBusy] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleScope(s: string) {
    setScopes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreatedKey(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, scopes }),
      });
      const json = (await res.json()) as
        | { success: true; data: { id: string; name: string; key_prefix: string; scopes: string[]; status: string; last_used_at: string | null; created_at: string; key: string } }
        | { success: false; error: { message: string } };
      if (!res.ok || !json.success) {
        const text =
          "error" in json && json.error?.message
            ? json.error.message
            : `HTTP ${res.status}`;
        throw new Error(text);
      }
      setCreatedKey(json.data.key);
      setKeys((prev) => [
        {
          id: json.data.id,
          name: json.data.name,
          key_prefix: json.data.key_prefix,
          scopes: json.data.scopes,
          status: json.data.status,
          last_used_at: null,
          created_at: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      setName("");
      setScopes(["read"]);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(id: string) {
    if (!confirm("Revoke this key? Existing requests using it will fail immediately.")) {
      return;
    }
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)),
      );
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl2 border border-border bg-surface-2 p-4">
        <h2 className="mb-3 text-sm font-semibold">Create new key</h2>
        <form onSubmit={onCreate} className="grid grid-cols-1 gap-3 md:max-w-2xl">
          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-ink-2">Name</div>
            <input
              className={inputCls}
              placeholder="My automation script"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-ink-2">Scopes</legend>
            <div className="flex flex-wrap gap-2">
              {SCOPE_OPTIONS.map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer rounded-full border px-2 py-1 text-xs ${
                    scopes.includes(s)
                      ? "border-brand bg-brand/15 text-brand-300"
                      : "border-border bg-surface text-ink-2"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={scopes.includes(s)}
                    onChange={() => toggleScope(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          {error ? (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : null}
          {createdKey ? (
            <div className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm">
              <div className="mb-1 font-semibold text-warn">
                Copy this key now — it will not be shown again:
              </div>
              <code className="block break-all rounded bg-surface px-2 py-1 text-xs text-brand-300">
                {createdKey}
              </code>
            </div>
          ) : null}
          <div>
            <button
              type="submit"
              disabled={busy || scopes.length === 0}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create API key"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl2 border border-border bg-surface-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <h2 className="text-sm font-semibold">All API keys</h2>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
            {keys.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-y border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                <th>Name</th>
                <th>Prefix</th>
                <th>Scopes</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted">
                    No API keys yet.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr
                    key={k.id}
                    className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                  >
                    <td className="font-medium text-ink">{k.name}</td>
                    <td>
                      <code className="rounded bg-surface px-2 py-1 text-xs text-brand-300">
                        {k.key_prefix}…
                      </code>
                    </td>
                    <td className="text-ink-2 text-xs">{k.scopes.join(", ")}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          k.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted-2/15 text-muted"
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="text-ink-2">{k.created_at}</td>
                    <td className="text-right">
                      {k.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => onRevoke(k.id)}
                          className="rounded-md border border-danger/40 bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
