import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/validate";
import { listClicks } from "@/lib/data/clicks";

export const dynamic = "force-dynamic";

const schema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(50),
  from: z.string().optional(),
  to: z.string().optional(),
  product_id: z.string().optional(),
  landing_page_id: z.string().optional(),
  utm_source: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  include_bots: z.coerce.boolean().default(false),
  include_duplicates: z.coerce.boolean().default(false),
  sort: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export async function GET(request: Request) {
  const auth = await authorize(request, ["clicks:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = parseQuery(new URL(request.url), schema);
  if (!parsed.ok) return parsed.response;
  const { items, total } = await listClicks(parsed.data);
  return ok(items, { page: parsed.data.page, pageSize: parsed.data.pageSize, total });
}
