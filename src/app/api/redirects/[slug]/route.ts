import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { getProductBySlug } from "@/lib/data/products";
import { listClicks } from "@/lib/data/clicks";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const auth = await authorize(request, ["products:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const product = await getProductBySlug(params.slug);
  if (!product) return errors.notFound("Redirect not found");
  const { items, total } = await listClicks({
    page: 1,
    pageSize: 1,
    product_id: product.id,
    include_bots: true,
    include_duplicates: true,
    order: "desc",
  });
  const base = env.siteUrl.replace(/\/$/, "");
  const redirect_url = product.short_code
    ? `${base}/${product.short_code}`
    : `${base}/go/${product.slug}`;
  return ok({
    slug: product.slug,
    short_code: product.short_code,
    redirect_url,
    destination_url: product.destination_url,
    status: product.status,
    total_clicks: total,
    last_click_at: items[0]?.created_at ?? null,
  });
}
