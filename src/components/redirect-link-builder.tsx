"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { IconChevronDown, IconCopy, IconLink } from "./icons";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

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

function toSlug(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || Math.random().toString(36).slice(2, 8)
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

export function RedirectLinkBuilder({
  products: initProducts,
  siteUrl,
}: RedirectLinkBuilderProps) {
  const router = useRouter();
  const origin = deriveOrigin(siteUrl);
  const host = deriveHost(origin || "https://example.com");

  const [products, setProducts] = useState(initProducts);

  // New-link form
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [name, setName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedProduct, setSavedProduct] = useState<RedirectBuilderProduct | null>(null);

  // Saved-product picker
  const [pickId, setPickId] = useState(initProducts[0]?.id ?? "");

  // UTM
  const [showUtm, setShowUtm] = useState(false);
  const [trafficSource, setTrafficSource] = useState("facebook");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [enableClickId, setEnableClickId] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setProducts(initProducts);
  }, [initProducts]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  // Auto-fill slug from name
  useEffect(() => {
    if (name && !customSlug) {
      // don't auto-update if user manually typed a slug
    }
  }, [name, customSlug]);

  // Active product: either the just-saved one or the picker selection
  const activeProduct = useMemo(
    () => savedProduct ?? products.find((p) => p.id === pickId) ?? null,
    [savedProduct, products, pickId],
  );

  function buildUrl(product: RedirectBuilderProduct) {
    const path = product.short_code ? `/${product.short_code}` : `/${product.slug}`;
    const base = `${origin}${path}`;
    const params: [string, string][] = [];
    if (showUtm) {
      params.push(["utm_source", trafficSource]);
      params.push(["utm_medium", medium]);
      if (campaign) params.push(["utm_campaign", campaign]);
      if (content) params.push(["utm_content", content]);
      if (term) params.push(["utm_term", term]);
    }
    if (enableClickId) params.push(["fbclid", "{fbclid}"]);
    if (!params.length) return base;
    return `${base}?${params
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${v.startsWith("{") ? v : encodeURIComponent(v)}`,
      )
      .join("&")}`;
  }

  const generatedUrl = useMemo(
    () => (activeProduct ? buildUrl(activeProduct) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProduct, origin, showUtm, trafficSource, medium, campaign, content, term, enableClickId],
  );

  async function handleCopy() {
    if (!generatedUrl) return;
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
      }
    } catch {
      /* ignore */
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    const slug = customSlug || toSlug(name);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: name,
          slug,
          destination_url: affiliateUrl,
          status: "active",
        }),
      });
      const json = await res.json() as
        | { success: true; data: RedirectBuilderProduct }
        | { success: false; error: { message: string } };
      if (!res.ok || !json.success) {
        throw new Error("error" in json ? json.error.message : `HTTP ${res.status}`);
      }
      const p: RedirectBuilderProduct = {
        id: json.data.id,
        slug: json.data.slug,
        title: json.data.title,
        destination_url: json.data.destination_url,
        short_code: json.data.short_code,
      };
      setProducts((prev) => [...prev, p]);
      setPickId(p.id);
      setSavedProduct(p);
      // reset form
      setAffiliateUrl("");
      setName("");
      setCustomSlug("");
      router.refresh();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handlePickChange(id: string) {
    setPickId(id);
    setSavedProduct(null);
  }

  const previewSlug = customSlug || (name ? toSlug(name) : "");

  return (
    <div className="rounded-xl2 border border-border bg-surface-2 p-4">
      <div className="mb-4 flex items-center gap-2 text-ink">
        <IconLink className="text-brand-300" />
        <span className="text-sm font-semibold">Redirect Link Builder</span>
      </div>

      {/* ── Step 1: Input link affiliate ── */}
      <form onSubmit={handleSave} className="space-y-3">
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">
            Link Affiliate <span className="text-danger">*</span>
          </div>
          <input
            type="url"
            required
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="https://s.shopee.co.id/xxxxx"
            className={inputCls}
          />
        </label>

        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">
            Nama Produk <span className="text-danger">*</span>
          </div>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sepatu Nike Air Max"
            className={inputCls}
          />
        </label>

        <label className="block">
          <div className="mb-1.5 flex items-center gap-1 text-xs font-medium text-ink-2">
            Custom Link
            <span className="font-normal text-muted">(opsional)</span>
          </div>
          <div className="flex items-center rounded-lg border border-border bg-surface focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
            <span className="select-none border-r border-border px-2.5 py-2 text-xs text-muted">
              {host}/
            </span>
            <input
              value={customSlug}
              onChange={(e) =>
                setCustomSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]/g, "")
                    .slice(0, 60),
                )
              }
              placeholder={previewSlug || "auto"}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:outline-none"
            />
          </div>
        </label>

        {saveError && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {saveError}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : "Buat Link Trackable"}
        </button>
      </form>

      {/* ── Divider ── */}
      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted">atau pilih yang tersimpan</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* ── Step 2: Pick saved product ── */}
      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-center text-xs text-muted">Belum ada link tersimpan.</p>
        ) : (
          <div className="relative">
            <select
              value={pickId}
              onChange={(e) => handlePickChange(e.target.value)}
              className={`${inputCls} appearance-none pr-8`}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        )}

        {/* Trackable link output */}
        {generatedUrl && (
          <div className="relative rounded-lg border border-brand/30 bg-brand/5 px-3 py-2.5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
              Link yang Bisa Di-track
            </div>
            <p className="break-all pr-6 text-xs leading-relaxed text-ink-2">{generatedUrl}</p>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy link"
              className="absolute right-2 top-2 rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink"
            >
              <IconCopy />
            </button>
            {copied && (
              <span className="absolute -top-2 right-8 rounded-md bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                Copied!
              </span>
            )}
          </div>
        )}

        {activeProduct && (
          <button
            type="button"
            disabled={!generatedUrl}
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconLink className="text-white" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
        )}

        {/* UTM Parameters */}
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowUtm((v) => !v)}
            className="flex w-full items-center justify-between text-xs text-ink-2 hover:text-ink"
          >
            <span>Tambah UTM Parameters</span>
            <IconChevronDown
              width={14}
              height={14}
              className={`transition-transform ${showUtm ? "rotate-180" : ""}`}
            />
          </button>

          {showUtm && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                    Source (utm_source)
                  </div>
                  <div className="relative">
                    <select
                      value={trafficSource}
                      onChange={(e) => setTrafficSource(e.target.value)}
                      className={`${inputCls} appearance-none pr-7`}
                    >
                      <option value="facebook">facebook</option>
                      <option value="instagram">instagram</option>
                      <option value="meta">meta</option>
                      <option value="tiktok">tiktok</option>
                      <option value="google">google</option>
                      <option value="email">email</option>
                      <option value="organic">organic</option>
                    </select>
                    <IconChevronDown
                      width={13}
                      height={13}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </label>
                <label className="block">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                    Medium (utm_medium)
                  </div>
                  <div className="relative">
                    <select
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className={`${inputCls} appearance-none pr-7`}
                    >
                      <option value="cpc">cpc</option>
                      <option value="paid">paid</option>
                      <option value="social">social</option>
                      <option value="email">email</option>
                      <option value="organic">organic</option>
                    </select>
                    <IconChevronDown
                      width={13}
                      height={13}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                  Campaign (utm_campaign)
                </div>
                <input
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="summer-sale"
                  className={inputCls}
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                    Content (utm_content)
                  </div>
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="banner-1"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                    Term (utm_term)
                  </div>
                  <input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="keyword"
                    className={inputCls}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                <span className="text-xs text-ink-2">Enable Click ID (fbclid)</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={enableClickId}
                    onChange={(e) => setEnableClickId(e.target.checked)}
                  />
                  <span className="track" />
                  <span className="thumb" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
