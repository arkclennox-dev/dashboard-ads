"use client";

import { useEffect, useMemo, useState } from "react";
import { IconChevronDown, IconCopy, IconInfo, IconLink } from "./icons";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-2">
        <span>{label}</span>
        {hint && (
          <span title={hint} className="text-muted-2">
            <IconInfo width={13} height={13} />
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

interface ToggleRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, hint, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5 text-sm text-ink-2">
        <span>{label}</span>
        {hint && (
          <span title={hint} className="text-muted-2">
            <IconInfo width={13} height={13} />
          </span>
        )}
      </div>
      <label className="toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="track" />
        <span className="thumb" />
      </label>
    </div>
  );
}

export function RedirectLinkBuilder() {
  const [destinationUrl, setDestinationUrl] = useState(
    "https://www.acme.com/landing-page",
  );
  const [domain, setDomain] = useState("go.acme.com");
  const [path, setPath] = useState("summer-sale");
  const [trafficSource, setTrafficSource] = useState("facebook");
  const [campaignSource, setCampaignSource] = useState("{{campaign.name}}");
  const [medium, setMedium] = useState("cpc");
  const [content, setContent] = useState("{{adset.name}}");
  const [term, setTerm] = useState("{{ad.name}}");
  const [matchType, setMatchType] = useState("Exact");
  const [enableClickId, setEnableClickId] = useState(true);
  const [enableTracking, setEnableTracking] = useState(true);
  const [appendUtm, setAppendUtm] = useState(true);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => {
    const base = `https://${domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}/${path}`;
    const params: Array<[string, string]> = [];
    if (appendUtm) {
      params.push(["source", trafficSource]);
      params.push(["medium", medium]);
      if (campaignSource) params.push(["campaign", campaignSource]);
      if (content) params.push(["content", content]);
      if (term) params.push(["term", term]);
    }
    if (enableClickId) params.push(["fbclid", "{fbclid}"]);
    return params.length
      ? `${base}?${params.map(([k, v]) => `${k}=${v}`).join("&")}`
      : base;
  }, [
    domain,
    path,
    trafficSource,
    medium,
    campaignSource,
    content,
    term,
    enableClickId,
    appendUtm,
  ]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(generated);
        setCopied(true);
      }
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl2 border border-border bg-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink">
          <IconLink className="text-brand-300" />
          <span className="text-sm font-semibold">Redirect Link Builder</span>
        </div>
        <IconChevronDown className="text-muted" />
      </div>

      <div className="space-y-3">
        <Field
          label="Destination URL"
          hint="Where the user lands after the redirect."
        >
          <input
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            className={inputCls}
            placeholder="https://example.com/landing"
          />
        </Field>

        <Field label="Domain" hint="Your branded short domain.">
          <div className="relative">
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className={inputCls}
            />
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Path" hint="Slug appended to the domain.">
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Traffic Source" hint="utm_source value.">
            <div className="relative">
              <select
                value={trafficSource}
                onChange={(e) => setTrafficSource(e.target.value)}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option value="facebook">facebook</option>
                <option value="instagram">instagram</option>
                <option value="meta">meta</option>
                <option value="tiktok">tiktok</option>
                <option value="google">google</option>
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </Field>
        </div>

        <Field label="Campaign Source" hint="utm_campaign value.">
          <input
            value={campaignSource}
            onChange={(e) => setCampaignSource(e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Medium" hint="utm_medium value.">
            <div className="relative">
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option value="cpc">cpc</option>
                <option value="paid">paid</option>
                <option value="social">social</option>
                <option value="email">email</option>
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </Field>
          <Field label="Content" hint="utm_content value.">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Term" hint="utm_term value.">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Match Type" hint="Keyword match type.">
            <div className="relative">
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option>Exact</option>
                <option>Phrase</option>
                <option>Broad</option>
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </Field>
        </div>

        <div className="space-y-1.5 pt-1">
          <ToggleRow
            label="Enable Click ID (fbclid)"
            checked={enableClickId}
            onChange={setEnableClickId}
            hint="Include the platform-provided click ID on redirect."
          />
          <ToggleRow
            label="Enable Redirect Tracking"
            checked={enableTracking}
            onChange={setEnableTracking}
            hint="Log click events to your dashboard."
          />
          <ToggleRow
            label="Append UTM Parameters"
            checked={appendUtm}
            onChange={setAppendUtm}
            hint="Append utm_source, utm_medium, utm_campaign, etc."
          />
        </div>

        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          onClick={handleCopy}
        >
          <IconLink className="text-white" /> Generate Link
        </button>

        <div className="relative rounded-lg border border-border bg-surface px-3 py-2.5 text-xs leading-relaxed text-ink-2 break-all">
          {generated}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy generated link"
            className="absolute right-2 top-2 rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink"
          >
            <IconCopy />
          </button>
          {copied && (
            <span className="absolute -top-2 right-8 rounded-md bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              Copied
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
