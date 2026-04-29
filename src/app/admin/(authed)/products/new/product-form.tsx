"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function randomSlug(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function ProductForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [shortCode, setShortCode] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [sourcePlatform, setSourcePlatform] = useState("shopee");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(v: string) {
    setTitle(v);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          short_code: shortCode.trim() || null,
          destination_url: destinationUrl,
          description: description || null,
          category: category || null,
          source_platform: sourcePlatform || "shopee",
          status,
        }),
      });
      const json = (await res.json()) as
        | { success: true }
        | { success: false; error: { message: string } };
      if (!res.ok || !json.success) {
        const msg =
          "error" in json && json.error?.message
            ? json.error.message
            : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl grid-cols-1 gap-4">
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Title</div>
        <input
          className={inputCls}
          placeholder="Sepatu Nike Air Max"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-2">
          Custom Link{" "}
          <span className="font-normal text-muted">(opsional — digenerate otomatis jika kosong)</span>
        </div>
        <div className="flex items-center rounded-lg border border-border bg-surface focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
          <span className="select-none border-r border-border px-2.5 py-2 text-xs text-muted">
            /
          </span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
                  .slice(0, 80),
              );
            }}
            placeholder={title ? slugify(title) : "abc123"}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:outline-none"
          />
        </div>
      </label>

      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">
          Short code <span className="text-muted-2">(optional — leave blank for random)</span>
        </div>
        <input
          className={inputCls}
          placeholder="e.g. promo1 (used in https://your-site/promo1)"
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value)}
          pattern="[a-zA-Z0-9_-]{2,40}"
          title="2-40 chars, letters/digits/-/_"
        />
        <p className="mt-1 text-[11px] text-muted-2">
          Reserved paths not allowed: admin, api, go, rekomendasi, disclaimer, privacy-policy, login.
        </p>
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Destination URL</div>
        <input
          className={inputCls}
          type="url"
          placeholder="https://s.shopee.co.id/xxxxx"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Description</div>
        <textarea
          className={inputCls}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Category</div>
          <input
            className={inputCls}
            placeholder="general"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Source platform</div>
          <input
            className={inputCls}
            placeholder="shopee"
            value={sourcePlatform}
            onChange={(e) => setSourcePlatform(e.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Status</div>
        <select
          className={inputCls}
          value={status}
          onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </label>

      {error ? (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save product"}
        </button>
        <a href="/admin/products" className="text-sm text-muted hover:text-ink-2">
          Cancel
        </a>
      </div>
    </form>
  );
}
