import { PageShell } from "@/components/page-shell";
import { listMetaAccounts } from "@/lib/data/meta-accounts";
import { MetaAccountsClient } from "./meta-accounts-client";

export const dynamic = "force-dynamic";

export default async function MetaAccountsPage() {
  const accounts = await listMetaAccounts();
  return (
    <PageShell
      title="Akun Meta Ads"
      subtitle="Kelola beberapa akun iklan Meta. Setiap akun menggunakan token akses masing-masing."
    >
      <MetaAccountsClient initialAccounts={accounts} />
    </PageShell>
  );
}
