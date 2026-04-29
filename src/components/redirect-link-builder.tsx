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

export interface RedirectBuilderProduct {
  id: string;
  slug: string;
  title: string;
  destination_url: string;
  short_code?: string | null;
}

interface RedirectLinkBuilderProps {
  products: RedirectBuilderProduct[];
  siteUrl: string;
}

function deriveOrigin(siteUrl: string): string {
  const trimmed = siteUrl.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function deriveHost(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return origin.replace(/^https?:\/\//i, "");
  }
}

export function RedirectLinkBuilder({ products, siteUrl }: RedirectLinkBuilderProps) {
  const origin = deriveOrigin(siteUrl);
  const host = deriveHost(origin || "https://example.com");
  const hasProducts = products.length > 0;

  const [productId, setProductId] = useState<string>(products[0]?.id ?? "");
  const [trafficSource, setTrafficSource] = useState("facebook");
  const [campaign, setCampaign] = useState("");
  const [medium, setMedium] = useState("cpc");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [enableClickId, setEnableClickId] = useState(true);
  const [enableTracking, setEnableTracking] = useState(true);
  const [appendUtm, setAppendUtm] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!productId && products[0]) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  );

  const generated = useMemo(() => {
    if (!selectedProduct) return "";
    if (!enableTracking) {
      // If tracking is off, point straight to the destination URL.
      const params: Array<[string, string]> = [];
      if (appendUtm) {
        params.push(["utm_source", trafficSource]);
        params.push(["utm_medium", medium]);
        if (campaign) params.push(["utm_campaign", campaign]);
        if (content) params.push(["utm_content", content]);
        if (term) params.push(["utm_term", term]);
      }
      const sep = selectedProduct.destination_url.includes("?") ? "&" : "?";
      const qs = params
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      return params.length
        ? `${selectedProduct.destination_url}${sep}${qs}`
        : selectedProduct.destination_url;
    }
    const path = selectedProduct.short_code
      ? `/${selectedProduct.short_code}`
      : `/go/${selectedProduct.slug}`;
    const base = `${origin}${path}`;
    const params: Array<[string, string]> = [];
    if (appendUtm) {
      params.push(["utm_source", trafficSource]);
      params.push(["utm_medium", medium]);
      if (campaign) params.push(["utm_campaign", campaign]);
      if (content) params.push(["utm_content", content]);
      if (term) params.push(["utm_term", term]);
    }
    if (enableClickId) params.push(["fbclid", "{fbclid}"]);
    return params.length
      ? `${base}?${params
          .map(([k, v]) => `${encodeURIComponent(k)}=${v.startsWith("{") ? v : encodeURIComponent(v)}`)
          .join("&")}`
      : base;
  }, [
    selectedProduct,
    origin,
    trafficSource,
    medium,
    campaign,
    content,
    term,
    enableClickId,
    enableTracking,
    appendUtm,
  ]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    if (!generated) return;
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
          label="Product"
          hint="Pick the affiliate product this redirect points to."
        >
          <div className="relative">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={`${inputCls} appearance-none pr-8`}
              disabled={!hasProducts}
            >
              {!hasProducts && <option value="">No products yet</option>}
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.short_code ? `/${p.short_code}` : `/go/${p.slug}`})
                </option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </Field>

        <Field
          label="Destination URL"
          hint="Where the user lands after the redirect (read from the product)."
        >
          <input
            value={selectedProduct?.destination_url ?? ""}
            readOnly
            className={`${inputCls} cursor-not-allowed text-muted`}
            placeholder="Pick a product first"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Domain" hint="Your site origin (NEXT_PUBLIC_SITE_URL).">
            <input value={host} readOnly className={`${inputCls} cursor-not-allowed text-muted`} />
          </Field>
          <Field label="Path" hint="Tracked redirect path.">
            <input
              value={
                selectedProduct
                  ? selectedProduct.short_code
                    ? `/${selectedProduct.short_code}`
                    : `/go/${selectedProduct.slug}`
                  : ""
              }
              readOnly
              className={`${inputCls} cursor-not-allowed text-muted`}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
                <option value="email">email</option>
                <option value="organic">organic</option>
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </Field>
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
                <option value="organic">organic</option>
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </Field>
        </div>

        <Field label="Campaign" hint="utm_campaign value.">
          <input
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className={inputCls}
            placeholder="summer-sale"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Content" hint="utm_content value.">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={inputCls}
              placeholder="banner-1"
            />
          </Field>
          <Field label="Term" hint="utm_term value.">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={inputCls}
              placeholder="keyword"
            />
          </Field>
        </div>

        <div className="space-y-1.5 pt-1">
          <ToggleRow
            label="Enable Redirect Tracking"
            checked={enableTracking}
            onChange={setEnableTracking}
            hint="When on, the URL points at the short code so clicks are logged. When off, points straight at the destination."
          />
          <ToggleRow
            label="Enable Click ID (fbclid)"
            checked={enableClickId}
            onChange={setEnableClickId}
            hint="Append fbclid={fbclid} placeholder for Meta to fill in."
          />
          <ToggleRow
            label="Append UTM Parameters"
            checked={appendUtm}
            onChange={setAppendUtm}
            hint="Append utm_source, utm_medium, utm_campaign, utm_content, utm_term."
          />
        </div>

        <button
          type="button"
          disabled={!selectedProduct}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleCopy}
        >
          <IconLink className="text-white" /> {copied ? "Copied!" : "Generate & Copy Link"}
        </button>

        <div className="relative rounded-lg border border-border bg-surface px-3 py-2.5 text-xs leading-relaxed text-ink-2 break-all">
          {generated || (
            <span className="text-muted">
              {hasProducts
                ? "Pick a product to generate a link."
                : "Add a product in /admin/products first."}
            </span>
          )}
          {generated && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy generated link"
              className="absolute right-2 top-2 rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink"
            >
              <IconCopy />
            </button>
          )}
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
