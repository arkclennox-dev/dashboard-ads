import { PageShell } from "@/components/page-shell";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

export default function NewProductPage() {
  return (
    <PageShell title="New product" subtitle="Create a new affiliate destination.">
      <form className="grid max-w-2xl grid-cols-1 gap-4">
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Title</div>
          <input className={inputCls} placeholder="Produk Test 01" name="title" />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Slug</div>
          <input className={inputCls} placeholder="produk-test-01" name="slug" />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Destination URL</div>
          <input
            className={inputCls}
            placeholder="https://s.shopee.co.id/xxxxx"
            name="destination_url"
          />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Description</div>
          <textarea className={inputCls} rows={3} name="description" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-ink-2">Category</div>
            <input className={inputCls} placeholder="general" name="category" />
          </label>
          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-ink-2">Source platform</div>
            <input className={inputCls} placeholder="shopee" name="source_platform" />
          </label>
        </div>
        <button
          type="button"
          className="w-fit rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
          disabled
          title="POST /api/products"
        >
          Save (calls POST /api/products)
        </button>
      </form>
    </PageShell>
  );
}
