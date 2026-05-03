"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  IconChevronDown,
  IconCopy,
  IconLink,
} from "./icons";

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

  // Build / UTM
  const [productId, setProductId] = useState(initProducts[0]?.id ?? "");
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
    if (!productId && products[0]) setProductId(products[0].id);
  }, [products, productId]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  );

  const generatedUrl = useMemo(() => {
    if (!selectedProduct) return "";
    const path = selectedProduct.short_code
      ? `/${selectedProduct.short_code}`
      : `/${selectedProduct.slug}`;
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
  }, [
    selectedProduct,
    origin,
    showUtm,
    trafficSource,
    medium,
    campaign,
    content,
    term,
    enableClickId,
  ]);

  async function handleCopy() {
    if (!generatedUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
      }
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-border bg-surface-2 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink">
          <IconLink className="text-brand-300" />
          <span className="text-sm font-semibold">Redirect Link Builder</span>
        </div>
      </div>

      <div className="space-y-3">
          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-ink-2">Produk</div>
            <div className="relative">
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
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
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-ink-2">Tujuan Akhir</div>
            <input
              value={selectedProduct?.destination_url ?? ""}
              readOnly
              className={`${inputCls} cursor-not-allowed text-muted`}
              placeholder="Pilih produk"
            />
          </label>

          <div className="relative rounded-lg border border-brand/30 bg-brand/5 px-3 py-2.5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
              Link yang Bisa Di-track
            </div>
            <p className="break-all pr-6 text-xs leading-relaxed text-ink-2">
              {generatedUrl || (
                <span className="text-muted">Pilih produk untuk melihat link.</span>
              )}
            </p>
            {generatedUrl && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy link"
                className="absolute right-2 top-2 rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink"
              >
                <IconCopy />
              </button>
            )}
            {copied && (
              <span className="absolute -top-2 right-8 rounded-md bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                Copied!
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedProduct}
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconLink className="text-white" />
            {copied ? "Copied!" : "Copy Link"}
          </button>

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
