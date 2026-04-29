import { randomUUID } from "crypto";
import type {
  AdSpendReport,
  AffiliateProduct,
  ApiKeyMeta,
  ClickEvent,
  LandingPage,
  LandingPageProduct,
  SiteSettings,
} from "./types";

interface Store {
  products: AffiliateProduct[];
  landingPages: LandingPage[];
  landingPageProducts: LandingPageProduct[];
  clicks: ClickEvent[];
  adSpend: AdSpendReport[];
  settings: SiteSettings;
  apiKeys: ApiKeyMeta[];
}

const g = globalThis as unknown as { __dashboardAdsStore?: Store };

function seed(): Store {
  const now = new Date().toISOString();
  const products: AffiliateProduct[] = [
    {
      id: randomUUID(),
      title: "US - Broad - Interests",
      slug: "us-broad-interests",
      short_code: "usbrdi",
      description: "Top affiliate offer for broad interest audiences in the US.",
      image_url:
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=60",
      destination_url: "https://shopee.co.id/",
      category: "general",
      source_platform: "shopee",
      status: "active",
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      title: "US - Lookalike 1%",
      slug: "us-lookalike-1",
      short_code: "uslk1x",
      description: "Lookalike audience offer.",
      image_url: null,
      destination_url: "https://shopee.co.id/",
      category: "general",
      source_platform: "shopee",
      status: "active",
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      title: "CA - Broad - Interests",
      slug: "ca-broad-interests",
      short_code: "cabrdi",
      description: "Canadian broad interest offer.",
      image_url: null,
      destination_url: "https://shopee.co.id/",
      category: "general",
      source_platform: "shopee",
      status: "active",
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      title: "UK - Broad - Interests",
      slug: "uk-broad-interests",
      short_code: "ukbrdi",
      description: "UK broad interest offer.",
      image_url: null,
      destination_url: "https://shopee.co.id/",
      category: "general",
      source_platform: "shopee",
      status: "inactive",
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      title: "US - Retargeting - 30D",
      slug: "us-retargeting-30d",
      short_code: "usrt30",
      description: "30-day retargeting audience.",
      image_url: null,
      destination_url: "https://shopee.co.id/",
      category: "retargeting",
      source_platform: "shopee",
      status: "active",
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      title: "AU - Lookalike 1%",
      slug: "au-lookalike-1",
      short_code: "aulk1x",
      description: "Australia 1% lookalike.",
      image_url: null,
      destination_url: "https://shopee.co.id/",
      category: "general",
      source_platform: "shopee",
      status: "inactive",
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      title: "US - Video Viewers",
      slug: "us-video-viewers",
      short_code: "usvidv",
      description: "Audience of video viewers.",
      image_url: null,
      destination_url: "https://shopee.co.id/",
      category: "engagement",
      source_platform: "shopee",
      status: "active",
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      title: "CA - Retargeting - 7D",
      slug: "ca-retargeting-7d",
      short_code: "cart7d",
      description: "Canadian 7-day retargeting.",
      image_url: null,
      destination_url: "https://shopee.co.id/",
      category: "retargeting",
      source_platform: "shopee",
      status: "inactive",
      notes: null,
      created_at: now,
      updated_at: now,
    },
  ];

  const landing: LandingPage = {
    id: randomUUID(),
    title: "Rekomendasi Produk Test",
    slug: "produk-test",
    intro: "Ini halaman test untuk melihat performa klik affiliate.",
    content: null,
    meta_title: "Rekomendasi Produk Test",
    meta_description: "Daftar produk test untuk tracking affiliate click.",
    featured_image_url: null,
    disclosure_text:
      "Beberapa link di halaman ini adalah link affiliate. Saya bisa menerima komisi jika kamu membeli melalui link tersebut.",
    status: "published",
    custom_head_script: null,
    custom_body_script: null,
    created_at: now,
    updated_at: now,
  };

  const landingPageProducts: LandingPageProduct[] = products.slice(0, 3).map((p, i) => ({
    id: randomUUID(),
    landing_page_id: landing.id,
    product_id: p.id,
    sort_order: i + 1,
    custom_title: null,
    custom_description: null,
    custom_cta: "Cek di Shopee",
    created_at: now,
  }));

  // Click + spend history for the past 7 days
  const clicks: ClickEvent[] = [];
  const adSpend: AdSpendReport[] = [];
  const today = new Date();
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - dayOffset);
    const dateStr = day.toISOString().slice(0, 10);

    products.forEach((p, idx) => {
      const baseClicks = 60 - idx * 6 + Math.floor(Math.random() * 12);
      for (let i = 0; i < baseClicks; i++) {
        clicks.push({
          id: randomUUID(),
          product_id: p.id,
          landing_page_id: idx < 3 ? landing.id : null,
          product_slug: p.slug,
          landing_page_slug: idx < 3 ? landing.slug : null,
          redirect_slug: p.slug,
          destination_url: p.destination_url,
          utm_source: "meta",
          utm_medium: "paid",
          utm_campaign: `campaign_${(idx % 3) + 1}`,
          utm_content: `creative_${(idx % 4) + 1}`,
          utm_term: p.slug,
          referrer: "https://facebook.com/",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS) Mobile/15E148",
          ip_hash: `hash_${idx}_${i}`,
          country: idx % 2 === 0 ? "US" : "CA",
          device_type: i % 3 === 0 ? "desktop" : "mobile",
          browser: "Safari",
          os: "iOS",
          is_duplicate: i % 13 === 0,
          is_bot: i % 41 === 0,
          created_at: new Date(day.getTime() + i * 60 * 1000).toISOString(),
        });
      }

      adSpend.push({
        id: randomUUID(),
        report_date: dateStr,
        platform: "meta",
        campaign_name: `Traffic Test ${(idx % 3) + 1}`,
        adset_name: p.title,
        ad_name: `Creative ${(idx % 4) + 1}`,
        utm_campaign: `campaign_${(idx % 3) + 1}`,
        utm_content: `creative_${(idx % 4) + 1}`,
        utm_term: p.slug,
        spend: Number((40 + idx * 15 + dayOffset * 8).toFixed(2)),
        impressions: 4000 + idx * 1500 + dayOffset * 300,
        link_clicks: baseClicks + 8,
        landing_page_views: baseClicks - 4,
        notes: null,
        created_at: now,
        updated_at: now,
      });
    });
  }

  const settings: SiteSettings = {
    id: randomUUID(),
    site_name: "Affiliate Click Dashboard",
    site_url: "https://yourdomain.com",
    default_disclosure_text:
      "Beberapa link di halaman ini adalah link affiliate. Saya bisa menerima komisi jika kamu membeli melalui link tersebut, tanpa biaya tambahan untuk kamu.",
    meta_pixel_id: null,
    ga4_measurement_id: null,
    global_head_script: null,
    global_body_script: null,
    created_at: now,
    updated_at: now,
  };

  return {
    products,
    landingPages: [landing],
    landingPageProducts,
    clicks,
    adSpend,
    settings,
    apiKeys: [],
  };
}

export function getDemoStore(): Store {
  if (!g.__dashboardAdsStore) {
    g.__dashboardAdsStore = seed();
  }
  return g.__dashboardAdsStore;
}

export function resetDemoStore(): void {
  g.__dashboardAdsStore = seed();
}
