import { PageShell } from "@/components/page-shell";
import { listProducts } from "@/lib/data/products";
import { env } from "@/lib/env";
import { LandingPageForm } from "./landing-page-form";

export const dynamic = "force-dynamic";

export default async function NewLandingPagePage() {
  const { items } = await listProducts({ page: 1, pageSize: 200 }, env.siteUrl);
  return (
    <PageShell
      title="New landing page"
      subtitle="Group products into a public /rekomendasi/[slug] page."
    >
      <LandingPageForm
        products={items.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))}
      />
    </PageShell>
  );
}
