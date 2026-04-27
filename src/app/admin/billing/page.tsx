import { PageShell } from "@/components/page-shell";

export default function AdminBillingPage() {
  return (
    <PageShell title="Billing" subtitle="Plan, payment method, and invoices.">
      <div className="rounded-xl2 border border-border bg-surface-2 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Free plan</h2>
            <p className="mt-1 text-sm text-muted">
              Track up to 1,000 redirect clicks per month with full API access.
            </p>
          </div>
          <button
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
            disabled
          >
            Upgrade
          </button>
        </div>
      </div>
    </PageShell>
  );
}
