import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { upsertShopeeClicks } from "@/lib/data/shopee-clicks";

export const dynamic = "force-dynamic";

const rowSchema = z.object({
  tag_link: z.string().min(1),
  campaign_key: z.string().min(1),
  perujuk: z.string().min(1),
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  klik_count: z.number().int().min(0),
});

const schema = z.object({ rows: z.array(rowSchema).min(1).max(50000) });

export async function POST(request: Request) {
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);

  const parsed = await parseJson(request, schema);
  if (!parsed.ok) return parsed.response;

  const result = await upsertShopeeClicks(parsed.data.rows);
  if (result.error) return errors.server(result.error);

  return ok({ imported: result.ok });
}
