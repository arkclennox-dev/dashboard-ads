"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ProductForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [sourcePlatform, setSourcePlatform] = useState("shopee");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
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
    <form
      onSubmit={onSubmit}
      className="grid max-w-2xl grid-cols-1 gap-4"
    >
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Title</div>
        <input
          className={inputCls}
          placeholder="Produk Test 01"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Slug</div>
        <input
          className={inputCls}
          placeholder="produk-test-01"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          pattern="[a-z0-9-]+"
          title="lowercase letters, numbers, dashes only"
          required
        />
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
        <a
          href="/admin/products"
          className="text-sm text-muted hover:text-ink-2"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
