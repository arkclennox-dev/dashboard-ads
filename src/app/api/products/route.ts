import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok, created } from "@/lib/api/response";
import { parseJson, parseQuery, slugSchema, urlSchema } from "@/lib/api/validate";
import { createProduct, listProducts } from "@/lib/data/products";
import { env, isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  q: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  category: z.string().optional(),
  source_platform: z.string().optional(),
  sort: z.enum(["created_at", "title", "total_clicks"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export async function GET(request: Request) {
  const auth = await authorize(request, ["products:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);

  const parsed = parseQuery(new URL(request.url), listSchema);
  if (!parsed.ok) return parsed.response;

  const { items, total } = await listProducts(
    {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      q: parsed.data.q,
      status: parsed.data.status,
      category: parsed.data.category,
      sourcePlatform: parsed.data.source_platform,
      sort: parsed.data.sort,
      order: parsed.data.order,
    },
    env.siteUrl,
  );

  return ok(items, {
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    total,
  });
}

const createSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  short_code: z.string().min(2).max(40).optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  destination_url: urlSchema,
  category: z.string().optional().nullable(),
  source_platform: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["products:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, createSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const product = await createProduct(parsed.data);
    return created(product);
  } catch (err) {
    const code = (err as { code?: string }).code;
    const message = (err as Error).message ?? "Failed to create product";
    if (code === "CONFLICT" || code === "23505") {
      return errors.conflict(message);
    }
    if (code === "BAD_REQUEST") {
      return errors.badRequest(message);
    }
    return errors.server(message);
  }
}
