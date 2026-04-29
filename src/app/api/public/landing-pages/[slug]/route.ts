import { errors, ok } from "@/lib/api/response";
import { getLandingPageBySlug } from "@/lib/data/landing-pages";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const lp = await getLandingPageBySlug(params.slug);
  if (!lp || lp.status !== "published") {
    return errors.notFound("Landing page not found");
  }
  const base = env.siteUrl.replace(/\/$/, "");
  return ok({
    title: lp.title,
    slug: lp.slug,
    intro: lp.intro,
    disclosure_text: lp.disclosure_text,
    products: lp.products
      .filter((row) => row.product && row.product.status === "active")
      .map((row) => ({
        title: row.custom_title || row.product!.title,
        slug: row.product!.slug,
        description: row.custom_description || row.product!.description,
        image_url: row.product!.image_url,
        cta: row.custom_cta,
        redirect_url: row.product!.short_code
          ? `${base}/${row.product!.short_code}`
          : `${base}/go/${row.product!.slug}`,
      })),
  });
}
