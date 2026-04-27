import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-8">
      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-300">
        Affiliate Click Dashboard
      </span>
      <h1 className="text-4xl font-semibold tracking-tight">
        Track your affiliate redirects and Meta Ads performance.
      </h1>
      <p className="max-w-xl text-ink-2">
        Create branded redirect links, build simple landing pages, and measure cost per
        affiliate click — all in one place.
      </p>
      <div className="flex gap-3">
        <Link
          href="/admin"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
        >
          Open Dashboard
        </Link>
        <Link
          href="/admin/api-docs"
          className="rounded-lg border border-border-strong bg-surface-2 px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-3"
        >
          API docs
        </Link>
      </div>
    </main>
  );
}
