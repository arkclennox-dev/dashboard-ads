import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getProductBySlug } from "@/lib/data/products";
import { insertClick, isRecentDuplicate } from "@/lib/data/clicks";
import { detectDeviceType, getClientIp, hashIp, isLikelyBot } from "@/lib/ip";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: { slug: string } },
): Promise<Response> {
  const slug = context.params.slug;
  const url = new URL(req.url);
  const homeUrl = new URL("/", env.siteUrl || url.origin);

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (err) {
    console.error("Failed to load product for redirect", err);
    return NextResponse.redirect(homeUrl, 302);
  }

  if (!product || product.status !== "active") {
    return NextResponse.redirect(homeUrl, 302);
  }

  const userAgent = req.headers.get("user-agent");
  const ip = getClientIp(req);
  const ip_hash = hashIp(ip);
  const isBot = isLikelyBot(userAgent);

  let isDup = false;
  try {
    isDup = await isRecentDuplicate({
      product_id: product.id,
      ip_hash,
      user_agent: userAgent,
    });
  } catch (err) {
    console.error("Duplicate check failed", err);
  }

  try {
    await insertClick({
      product_id: product.id,
      product_slug: product.slug,
      redirect_slug: slug,
      destination_url: product.destination_url,
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_content: url.searchParams.get("utm_content"),
      utm_term: url.searchParams.get("utm_term"),
      referrer: req.headers.get("referer"),
      user_agent: userAgent,
      ip_hash,
      device_type: detectDeviceType(userAgent),
      is_duplicate: isDup,
      is_bot: isBot,
      landing_page_slug: url.searchParams.get("lp"),
    });
  } catch (err) {
    console.error("Click logging failed", err);
  }

  return NextResponse.redirect(product.destination_url, 302);
}
