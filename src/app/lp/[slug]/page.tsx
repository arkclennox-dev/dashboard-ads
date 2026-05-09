import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/lib/data/landing-pages";
import { defaultPageSettings } from "@/lib/types/sections";
import { LpSections } from "./lp-sections";
import { StickyCtaButton } from "./sticky-cta";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getLandingPageBySlug(params.slug);
  if (!page) return {};
  return {
    title: page.meta_title ?? page.title,
    description: page.meta_description ?? page.intro ?? undefined,
  };
}

export default async function LpPage({ params }: Props) {
  const page = await getLandingPageBySlug(params.slug);
  if (!page || page.status !== "published") notFound();

  const settings = { ...defaultPageSettings, ...(page.page_settings ?? {}) };
  const sections = (page.sections ?? []) as Parameters<typeof LpSections>[0]["sections"];

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ "--theme": settings.theme_color } as React.CSSProperties}>
      <LpSections sections={sections} settings={settings} />
      {settings.sticky_cta_enabled && (
        <StickyCtaButton
          text={settings.sticky_cta_text}
          type={settings.sticky_cta_type}
          value={settings.sticky_cta_value || settings.whatsapp_number}
          themeColor={settings.theme_color}
        />
      )}
    </div>
  );
}
