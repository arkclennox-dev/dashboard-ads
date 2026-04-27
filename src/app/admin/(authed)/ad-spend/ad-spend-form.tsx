"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AdSpendForm() {
  const router = useRouter();
  const [reportDate, setReportDate] = useState(todayIso());
  const [campaignName, setCampaignName] = useState("");
  const [adsetName, setAdsetName] = useState("");
  const [adName, setAdName] = useState("");
  const [platform, setPlatform] = useState("meta");
  const [spend, setSpend] = useState("");
  const [impressions, setImpressions] = useState("");
  const [linkClicks, setLinkClicks] = useState("");
  const [lpv, setLpv] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body = {
        report_date: reportDate,
        platform,
        campaign_name: campaignName,
        adset_name: adsetName || null,
        ad_name: adName || null,
        spend: Number(spend) || 0,
        impressions: impressions ? Number(impressions) : 0,
        link_clicks: linkClicks ? Number(linkClicks) : 0,
        landing_page_views: lpv ? Number(lpv) : 0,
      };
      const res = await fetch("/api/ad-spend", {
        method: "POST",
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
      setMsg({ type: "ok", text: "Spend report saved." });
      setCampaignName("");
      setAdsetName("");
      setAdName("");
      setSpend("");
      setImpressions("");
      setLinkClicks("");
      setLpv("");
      router.refresh();
    } catch (err) {
      setMsg({ type: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
    >
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Date</div>
        <input
          type="date"
          className={inputCls}
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Platform</div>
        <select
          className={inputCls}
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="meta">meta</option>
          <option value="google">google</option>
          <option value="tiktok">tiktok</option>
          <option value="other">other</option>
        </select>
      </label>
      <label className="block md:col-span-2">
        <div className="mb-1 text-xs text-ink-2">Campaign name</div>
        <input
          className={inputCls}
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Ad set</div>
        <input
          className={inputCls}
          value={adsetName}
          onChange={(e) => setAdsetName(e.target.value)}
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Ad</div>
        <input
          className={inputCls}
          value={adName}
          onChange={(e) => setAdName(e.target.value)}
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Spend</div>
        <input
          type="number"
          step="0.01"
          min="0"
          className={inputCls}
          value={spend}
          onChange={(e) => setSpend(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Impressions</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={impressions}
          onChange={(e) => setImpressions(e.target.value)}
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Link clicks</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={linkClicks}
          onChange={(e) => setLinkClicks(e.target.value)}
        />
      </label>
      <label className="block">
        <div className="mb-1 text-xs text-ink-2">Landing page views</div>
        <input
          type="number"
          min="0"
          className={inputCls}
          value={lpv}
          onChange={(e) => setLpv(e.target.value)}
        />
      </label>
      {msg ? (
        <div
          className={`md:col-span-2 lg:col-span-4 rounded-lg border px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {msg.text}
        </div>
      ) : null}
      <div className="md:col-span-2 lg:col-span-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Add spend report"}
        </button>
      </div>
    </form>
  );
}
