import { PageShell } from "@/components/page-shell";
import { listApiKeys } from "@/lib/data/api-keys";
import { formatDate } from "@/lib/format";
import { ApiKeysClient } from "./api-keys-client";

export const dynamic = "force-dynamic";

export default async function AdminApiKeysPage() {
  const keys = await listApiKeys();
  return (
    <PageShell title="API keys" subtitle="Scoped tokens for server-to-server access via x-api-key.">
      <ApiKeysClient
        initialKeys={keys.map((k) => ({
          id: k.id,
          name: k.name,
          key_prefix: k.key_prefix,
          scopes: k.scopes,
          status: k.status,
          last_used_at: k.last_used_at,
          created_at: formatDate(k.created_at),
        }))}
      />
    </PageShell>
  );
}
