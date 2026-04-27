import { PageShell } from "@/components/page-shell";

const items = [
  {
    title: "New click from US — Broad",
    when: "2 minutes ago",
    detail: "produk-test-01 redirected to https://shopee.co.id/",
  },
  {
    title: "Spend threshold reached",
    when: "12 minutes ago",
    detail: "Campaign Traffic Test 1 exceeded $500 spend.",
  },
  {
    title: "Duplicate click detected",
    when: "1 hour ago",
    detail: "Same IP hit /go/us-broad-interests within 10 minutes.",
  },
];

export default function AdminNotificationsPage() {
  return (
    <PageShell title="Notifications" subtitle="Recent alerts from your campaigns.">
      <div className="space-y-3">
        {items.map((n, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl2 border border-border bg-surface-2 p-4"
          >
            <div className="mt-1 h-2 w-2 rounded-full bg-brand" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{n.title}</h3>
                <span className="text-xs text-muted">{n.when}</span>
              </div>
              <p className="mt-1 text-sm text-ink-2">{n.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
