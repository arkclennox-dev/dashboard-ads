import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { fetchMetaInsights } from "@/lib/meta-api";
import { syncMetaAdSpend } from "@/lib/data/ad-spend";
import { env, isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

const syncSchema = z.object({
  since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export async function POST(request: Request) {
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);

  if (isDemoMode) {
    return errors.demoReadOnly();
  }

  if (!env.metaAccessToken || !env.metaAdAccountId) {
    return errors.server(
      "META_ACCESS_TOKEN dan META_AD_ACCOUNT_ID belum dikonfigurasi di environment variables.",
    );
  }

  const parsed = await parseJson(request, syncSchema);
  if (!parsed.ok) return parsed.response;

  const { since, until } = parsed.data;

  try {
    const rows = await fetchMetaInsights({
      accessToken: env.metaAccessToken,
      adAccountId: env.metaAdAccountId,
      since,
      until,
    });
    const count = await syncMetaAdSpend({ since, until, rows });
    return ok({ synced: count, since, until });
  } catch (err) {
    return errors.server((err as Error).message);
  }
}
