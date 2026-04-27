"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

interface SettingsState {
  site_name: string;
  site_url: string;
  default_disclosure_text: string;
  meta_pixel_id: string;
  ga4_measurement_id: string;
}

interface SettingsFormProps {
  initial: SettingsState;
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter();
  const [s, setS] = useState<SettingsState>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body: Record<string, string | null> = {
        site_name: s.site_name,
        default_disclosure_text: s.default_disclosure_text,
      };
      body.site_url = s.site_url || null;
      body.meta_pixel_id = s.meta_pixel_id || null;
      body.ga4_measurement_id = s.ga4_measurement_id || null;
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as
        | { success: true }
        | { success: false; error: { message: string } };
      if (!res.ok || !json.success) {
        const text =
          "error" in json && json.error?.message
            ? json.error.message
            : `HTTP ${res.status}`;
        throw new Error(text);
      }
      setMsg({ type: "ok", text: "Settings saved." });
      router.refresh();
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl grid-cols-1 gap-4">
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Site name</div>
        <input
          className={inputCls}
          value={s.site_name}
          onChange={(e) => update("site_name", e.target.value)}
        />
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Site URL</div>
        <input
          className={inputCls}
          type="url"
          placeholder="https://example.com"
          value={s.site_url}
          onChange={(e) => update("site_url", e.target.value)}
        />
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Disclosure text</div>
        <textarea
          className={inputCls}
          rows={4}
          value={s.default_disclosure_text}
          onChange={(e) => update("default_disclosure_text", e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Meta Pixel ID</div>
          <input
            className={inputCls}
            value={s.meta_pixel_id}
            onChange={(e) => update("meta_pixel_id", e.target.value)}
          />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">GA4 Measurement ID</div>
          <input
            className={inputCls}
            value={s.ga4_measurement_id}
            onChange={(e) => update("ga4_measurement_id", e.target.value)}
          />
        </label>
      </div>
      {msg ? (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {msg.text}
        </div>
      ) : null}
      <div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
