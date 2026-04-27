import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { listProducts } from "@/lib/data/products";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorize(request, ["products:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const { items, total } = await listProducts(
    { page: 1, pageSize: 200 },
    env.siteUrl,
  );
  return ok(
    items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      destination_url: p.destination_url,
      redirect_url: p.redirect_url,
      total_clicks: p.total_clicks,
    })),
    { page: 1, pageSize: items.length, total },
  );
}
