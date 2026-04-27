import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok, created } from "@/lib/api/response";
import { parseJson, parseQuery } from "@/lib/api/validate";
import { createAdSpend, listAdSpend } from "@/lib/data/ad-spend";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  from: z.string().optional(),
  to: z.string().optional(),
  platform: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await authorize(request, ["ad_spend:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = parseQuery(new URL(request.url), listSchema);
  if (!parsed.ok) return parsed.response;
  const { items, total } = await listAdSpend(parsed.data);
  return ok(items, { page: parsed.data.page, pageSize: parsed.data.pageSize, total });
}

const createSchema = z.object({
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  platform: z.string().optional(),
  campaign_name: z.string().min(1),
  adset_name: z.string().optional().nullable(),
  ad_name: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
  utm_content: z.string().optional().nullable(),
  utm_term: z.string().optional().nullable(),
  spend: z.number().nonnegative(),
  impressions: z.number().int().nonnegative().optional(),
  link_clicks: z.number().int().nonnegative().optional(),
  landing_page_views: z.number().int().nonnegative().optional(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, createSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const row = await createAdSpend(parsed.data);
    return created(row);
  } catch (err) {
    return errors.server((err as Error).message);
  }
}
