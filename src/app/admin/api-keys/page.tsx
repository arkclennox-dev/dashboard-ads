import { PageShell } from "@/components/page-shell";

export const dynamic = "force-dynamic";

export default function AdminApiKeysPage() {
  return (
    <PageShell title="Integrations" subtitle="Manage API keys for AI agents and automation.">
      <div className="rounded-xl2 border border-border bg-surface-2 p-6">
        <h2 className="text-base font-semibold">API keys</h2>
        <p className="mt-1 text-sm text-muted">
          Create scoped API keys for server-to-server access. Pass the key in the{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-brand-300">x-api-key</code>{" "}
          header.
        </p>
        <button
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
          disabled
          title="POST /api/api-keys"
        >
          Create API key
        </button>
        <p className="mt-3 text-xs text-muted-2">
          Configure Supabase to enable this feature. The endpoint will return the raw key
          exactly once.
        </p>
      </div>
    </PageShell>
  );
}
