import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { fetchMetaInsights } from "@/lib/meta-api";
import { syncMetaAdSpend } from "@/lib/data/ad-spend";
import { listActiveMetaAccounts } from "@/lib/data/meta-accounts";
import { env, isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

const syncSchema = z.object({
  since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export async function POST(request: Request) {
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);

  if (isDemoMode) return errors.demoReadOnly();

  const parsed = await parseJson(request, syncSchema);
  if (!parsed.ok) return parsed.response;

  const { since, until } = parsed.data;

  // Fetch accounts from DB; fall back to env vars if none configured
  let accounts = await listActiveMetaAccounts();
  if (accounts.length === 0) {
    if (!env.metaAccessToken || !env.metaAdAccountId) {
      return errors.server(
        "Belum ada akun Meta yang dikonfigurasi. Tambahkan di menu Akun Meta atau set META_ACCESS_TOKEN dan META_AD_ACCOUNT_ID.",
      );
    }
    accounts = [
      {
        id: "env",
        name: "Default (env)",
        ad_account_id: env.metaAdAccountId,
        access_token: env.metaAccessToken,
        is_active: true,
        created_at: "",
        updated_at: "",
      },
    ];
  }

  const results: { account: string; ad_account_id: string; synced: number; error?: string }[] = [];

  for (const account of accounts) {
    try {
      const rows = await fetchMetaInsights({
        accessToken: account.access_token,
        adAccountId: account.ad_account_id,
        since,
        until,
      });
      const count = await syncMetaAdSpend({
        since,
        until,
        meta_account_id: account.ad_account_id,
        rows,
      });
      results.push({ account: account.name, ad_account_id: account.ad_account_id, synced: count });
    } catch (err) {
      results.push({
        account: account.name,
        ad_account_id: account.ad_account_id,
        synced: 0,
        error: (err as Error).message,
      });
    }
  }

  const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
  return ok({ since, until, total_synced: totalSynced, accounts: results });
}
