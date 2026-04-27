import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { getLandingPageBySlug } from "@/lib/data/landing-pages";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lp = await getLandingPageBySlug(params.slug);
  if (!lp || lp.status !== "published") return { title: "Not found" };
  return {
    title: lp.meta_title ?? lp.title,
    description: lp.meta_description ?? lp.intro ?? undefined,
    alternates: { canonical: `${env.siteUrl}/rekomendasi/${lp.slug}` },
    openGraph: {
      title: lp.meta_title ?? lp.title,
      description: lp.meta_description ?? lp.intro ?? undefined,
      images: lp.featured_image_url ? [lp.featured_image_url] : undefined,
    },
  };
}

function buildCtaUrl(
  productSlug: string,
  landingSlug: string,
  search: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = search[k];
    if (typeof v === "string" && v) params.set(k, v);
  }
  params.set("lp", landingSlug);
  return `/go/${productSlug}?${params.toString()}`;
}

export default async function LandingPage({ params, searchParams }: PageProps) {
  const lp = await getLandingPageBySlug(params.slug);
  if (!lp || lp.status !== "published") notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 text-ink">
      <header className="mb-8">
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-300">
          Rekomendasi
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{lp.title}</h1>
        {lp.intro && <p className="mt-3 text-ink-2">{lp.intro}</p>}
      </header>

      {lp.featured_image_url && (
        <img
          src={lp.featured_image_url}
          alt=""
          className="mb-8 w-full rounded-xl2 border border-border object-cover"
        />
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {lp.products.map((row) => {
          const product = row.product;
          if (!product) return null;
          const ctaUrl = buildCtaUrl(product.slug, lp.slug, searchParams);
          const title = row.custom_title || product.title;
          const description = row.custom_description || product.description;
          return (
            <article
              key={row.product_id}
              className="flex flex-col overflow-hidden rounded-xl2 border border-border bg-surface-2"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt=""
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-base font-semibold">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-ink-2 line-clamp-3">{description}</p>
                )}
                <a
                  href={ctaUrl}
                  rel="nofollow sponsored"
                  className="mt-auto inline-flex items-center justify-center rounded-lg bg-brand py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-600"
                >
                  {row.custom_cta || "Cek di Shopee"}
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {lp.disclosure_text && (
        <p className="mt-10 rounded-lg border border-border bg-surface-2 p-4 text-xs text-muted">
          {lp.disclosure_text}
        </p>
      )}

      <footer className="mt-10 flex justify-between text-xs text-muted">
        <a href="/privacy-policy" className="hover:text-ink-2">
          Privacy Policy
        </a>
        <a href="/disclaimer" className="hover:text-ink-2">
          Disclaimer
        </a>
      </footer>
    </main>
  );
}
