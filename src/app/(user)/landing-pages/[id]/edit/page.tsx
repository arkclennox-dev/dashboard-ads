import { notFound } from "next/navigation";
import { getLandingPageById } from "@/lib/data/landing-pages";
import { defaultPageSettings } from "@/lib/types/sections";
import { BuilderClient } from "./builder-client";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: { id: string } }) {
  const page = await getLandingPageById(params.id);
  if (!page) notFound();

  const settings = { ...defaultPageSettings, ...(page.page_settings ?? {}) };
  const sections = page.sections ?? [];

  return (
    <BuilderClient
      id={page.id}
      title={page.title}
      slug={page.slug}
      status={page.status}
      initialSections={sections as Parameters<typeof BuilderClient>[0]["initialSections"]}
      initialSettings={settings}
    />
  );
}
