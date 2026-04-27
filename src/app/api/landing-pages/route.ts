import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok, created } from "@/lib/api/response";
import { parseJson, parseQuery, slugSchema } from "@/lib/api/validate";
import {
  createLandingPage,
  listLandingPages,
} from "@/lib/data/landing-pages";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  q: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sort: z.enum(["created_at", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export async function GET(request: Request) {
  const auth = await authorize(request, ["landing_pages:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = parseQuery(new URL(request.url), listSchema);
  if (!parsed.ok) return parsed.response;
  const { items, total } = await listLandingPages(parsed.data);
  return ok(items, { page: parsed.data.page, pageSize: parsed.data.pageSize, total });
}

const createSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  intro: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  featured_image_url: z.string().url().optional().nullable(),
  disclosure_text: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  custom_head_script: z.string().optional().nullable(),
  custom_body_script: z.string().optional().nullable(),
  products: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        sort_order: z.number().int().optional(),
        custom_title: z.string().optional().nullable(),
        custom_description: z.string().optional().nullable(),
        custom_cta: z.string().optional(),
      }),
    )
    .optional(),
});

export async function POST(request: Request) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["landing_pages:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, createSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const lp = await createLandingPage(parsed.data);
    return created(lp);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "CONFLICT" || code === "23505") {
      return errors.conflict("Slug already exists");
    }
    return errors.server((err as Error).message);
  }
}
