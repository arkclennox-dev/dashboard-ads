import type {
  LandingPageSection, PageSettings,
  HeroSection, BenefitsSection, GallerySection, TestimonialsSection,
  PricingSection, VideoSection, FaqSection, CtaSection,
} from "@/lib/types/sections";
import { CheckoutSection } from "./checkout-section";

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function youtubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function ctaHref(type: string, value: string, waNumber: string): string {
  if (type === "whatsapp") {
    const n = (value || waNumber).replace(/\D/g, "");
    return `https://wa.me/${n}`;
  }
  if (type === "link") return value;
  return "#checkout";
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero({ s, settings }: { s: HeroSection; settings: PageSettings }) {
  const href = ctaHref(s.cta_type, s.cta_url, settings.whatsapp_number);
  return (
    <section className="px-4 py-16 text-center max-w-2xl mx-auto">
      {s.image_url && (
        <img src={s.image_url} alt={s.headline} className="mx-auto mb-8 max-h-72 rounded-2xl object-cover shadow-lg" />
      )}
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
        {s.headline}
      </h1>
      {s.subheadline && (
        <p className="mt-4 text-lg text-gray-600">{s.subheadline}</p>
      )}
      <a
        href={href}
        className="mt-8 inline-block rounded-xl px-8 py-3 text-base font-bold text-white shadow-lg transition hover:opacity-90"
        style={{ backgroundColor: settings.theme_color }}
      >
        {s.cta_text}
      </a>
    </section>
  );
}

// ── Benefits ────────────────────────────────────────────────────────────────
function Benefits({ s }: { s: BenefitsSection }) {
  return (
    <section className="bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {s.title && <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{s.title}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-2 text-2xl">{item.emoji}</div>
              <div className="font-semibold text-gray-900">{item.title}</div>
              {item.description && <div className="mt-1 text-sm text-gray-600">{item.description}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ s }: { s: GallerySection }) {
  if (!s.images.length) return null;
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {s.title && <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{s.title}</h2>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {s.images.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-xl shadow-sm">
              <img src={img.url} alt={img.caption || `Foto ${i + 1}`} className="aspect-square w-full object-cover" />
              {img.caption && <div className="bg-gray-50 px-2 py-1 text-center text-xs text-gray-500">{img.caption}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials({ s }: { s: TestimonialsSection }) {
  return (
    <section className="bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {s.title && <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{s.title}</h2>}
        <div className="grid gap-4 sm:grid-cols-2">
          {s.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className={j < item.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
              </div>
              <p className="text-sm text-gray-700">&ldquo;{item.text}&rdquo;</p>
              <div className="mt-3 flex items-center gap-2">
                {item.avatar_url
                  ? <img src={item.avatar_url} alt={item.name} className="h-8 w-8 rounded-full object-cover" />
                  : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">{item.name.slice(0, 2).toUpperCase()}</div>
                }
                <span className="text-sm font-semibold text-gray-900">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ s, settings }: { s: PricingSection; settings: PageSettings }) {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-sm text-center">
        <div className="rounded-2xl border-2 p-8 shadow-lg" style={{ borderColor: settings.theme_color }}>
          {s.badge && (
            <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: settings.theme_color }}>
              {s.badge}
            </div>
          )}
          {s.original_price > 0 && (
            <div className="text-lg text-gray-400 line-through">{s.currency} {s.original_price.toLocaleString("id-ID")}</div>
          )}
          <div className="text-4xl font-extrabold text-gray-900">{s.currency} {s.sale_price.toLocaleString("id-ID")}</div>
          {s.note && <div className="mt-2 text-sm text-gray-500">{s.note}</div>}
        </div>
      </div>
    </section>
  );
}

// ── Video ────────────────────────────────────────────────────────────────────
function Video({ s }: { s: VideoSection }) {
  const vid = youtubeId(s.youtube_url);
  if (!vid) return null;
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {s.title && <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">{s.title}</h2>}
        <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${vid}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
function Faq({ s }: { s: FaqSection }) {
  return (
    <section className="bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {s.title && <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{s.title}</h2>}
        <div className="space-y-3">
          {s.items.map((item, i) => (
            <details key={i} className="group rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <summary className="cursor-pointer font-semibold text-gray-900 marker:content-none flex items-center justify-between">
                {item.question}
                <span className="ml-2 shrink-0 text-gray-400 transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────────────────
function Cta({ s, settings }: { s: CtaSection; settings: PageSettings }) {
  const href = ctaHref(s.cta_type, s.cta_url, settings.whatsapp_number);
  return (
    <section className="px-4 py-16 text-center">
      <div className="mx-auto max-w-xl">
        {s.headline && <h2 className="text-2xl font-extrabold text-gray-900">{s.headline}</h2>}
        {s.subtitle && <p className="mt-3 text-gray-600">{s.subtitle}</p>}
        <a
          href={href}
          className="mt-8 inline-block rounded-xl px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: settings.theme_color }}
        >
          {s.cta_text}
        </a>
      </div>
    </section>
  );
}

// ── Main renderer ────────────────────────────────────────────────────────────
interface Props {
  sections: LandingPageSection[];
  settings: PageSettings;
}

export function LpSections({ sections, settings }: Props) {
  return (
    <main>
      {sections.map((s) => {
        switch (s.type) {
          case "hero":         return <Hero key={s.id} s={s} settings={settings} />;
          case "benefits":     return <Benefits key={s.id} s={s} />;
          case "gallery":      return <Gallery key={s.id} s={s} />;
          case "testimonials": return <Testimonials key={s.id} s={s} />;
          case "pricing":      return <Pricing key={s.id} s={s} settings={settings} />;
          case "video":        return <Video key={s.id} s={s} />;
          case "faq":          return <Faq key={s.id} s={s} />;
          case "cta":          return <Cta key={s.id} s={s} settings={settings} />;
          case "checkout":     return <CheckoutSection key={s.id} s={s} settings={settings} />;
          default:             return null;
        }
      })}
    </main>
  );
}
