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

interface ProductOption {
  id: string;
  title: string;
  slug: string;
}

export function LandingPageForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [intro, setIntro] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function toggleProduct(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        title,
        slug,
        intro: intro || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        status,
        products: selected.map((product_id, i) => ({
          product_id,
          sort_order: i,
        })),
      };
      const res = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as
        | { success: true; data: { id: string } }
        | { success: false; error: { message: string } };
      if (!res.ok || !json.success) {
        const text =
          "error" in json && json.error?.message
            ? json.error.message
            : `HTTP ${res.status}`;
        throw new Error(text);
      }
      const id = "data" in json ? json.data?.id : null;
      router.push(id ? `/landing-pages/${id}/edit` : "/landing-pages");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl grid-cols-1 gap-4">
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Title</div>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Slug</div>
        <input
          className={inputCls}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          pattern="[a-z0-9-]+"
          required
        />
      </label>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Intro / hero</div>
        <textarea
          className={inputCls}
          rows={2}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Meta title</div>
          <input
            className={inputCls}
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Status</div>
          <select
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
      </div>
      <label className="block">
        <div className="mb-1.5 text-xs font-medium text-ink-2">Meta description</div>
        <textarea
          className={inputCls}
          rows={2}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
        />
      </label>
      <fieldset className="rounded-lg border border-border bg-surface-2 p-4">
        <legend className="px-1 text-xs font-medium text-ink-2">
          Products on this page ({selected.length} selected)
        </legend>
        {products.length === 0 ? (
          <p className="text-sm text-muted">
            No products yet — create one in /admin/products first.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {products.map((p) => (
              <li key={p.id}>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="mt-1 h-4 w-4 rounded border-border bg-surface text-brand"
                  />
                  <span>
                    <span className="text-ink">{p.title}</span>
                    <span className="ml-2 text-muted">/{p.slug}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
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
          {busy ? "Saving…" : "Save landing page"}
        </button>
        <a href="/landing-pages" className="text-sm text-muted hover:text-ink-2">
          Cancel
        </a>
      </div>
    </form>
  );
}
