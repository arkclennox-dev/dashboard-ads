export type SectionType =
  | "hero"
  | "benefits"
  | "gallery"
  | "testimonials"
  | "pricing"
  | "video"
  | "faq"
  | "cta"
  | "checkout";

export interface HeroSection {
  id: string; type: "hero";
  headline: string;
  subheadline: string;
  image_url: string;
  cta_text: string;
  cta_type: "whatsapp" | "link" | "scroll";
  cta_url: string;
}

export interface BenefitsSection {
  id: string; type: "benefits";
  title: string;
  items: Array<{ emoji: string; title: string; description: string }>;
}

export interface GallerySection {
  id: string; type: "gallery";
  title: string;
  images: Array<{ url: string; caption: string }>;
}

export interface TestimonialsSection {
  id: string; type: "testimonials";
  title: string;
  items: Array<{ name: string; rating: number; text: string; avatar_url: string }>;
}

export interface PricingSection {
  id: string; type: "pricing";
  original_price: number;
  sale_price: number;
  currency: string;
  badge: string;
  note: string;
}

export interface VideoSection {
  id: string; type: "video";
  title: string;
  youtube_url: string;
}

export interface FaqSection {
  id: string; type: "faq";
  title: string;
  items: Array<{ question: string; answer: string }>;
}

export interface CtaSection {
  id: string; type: "cta";
  headline: string;
  subtitle: string;
  cta_text: string;
  cta_type: "whatsapp" | "link" | "scroll";
  cta_url: string;
}

export interface CheckoutSection {
  id: string; type: "checkout";
  title: string;
  product_name: string;
  price: number;
  weight_gram: number;
  origin_area_id: string;
  origin_area_label: string;
  whatsapp_number: string;
  message_template: string;
}

export type LandingPageSection =
  | HeroSection
  | BenefitsSection
  | GallerySection
  | TestimonialsSection
  | PricingSection
  | VideoSection
  | FaqSection
  | CtaSection
  | CheckoutSection;

export interface PageSettings {
  theme_color: string;
  sticky_cta_enabled: boolean;
  sticky_cta_text: string;
  sticky_cta_type: "whatsapp" | "link" | "scroll";
  sticky_cta_value: string;
  whatsapp_number: string;
  page_mode?: "sections" | "html";
  custom_html?: string;
}

export const defaultPageSettings: PageSettings = {
  theme_color: "#2563eb",
  sticky_cta_enabled: true,
  sticky_cta_text: "Beli Sekarang",
  sticky_cta_type: "scroll",
  sticky_cta_value: "",
  whatsapp_number: "",
};

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  benefits: "Keunggulan",
  gallery: "Galeri Produk",
  testimonials: "Testimoni",
  pricing: "Harga",
  video: "Video",
  faq: "FAQ",
  cta: "Call to Action",
  checkout: "Form Order + Ongkir",
};

export function defaultSection(type: SectionType, id: string): LandingPageSection {
  switch (type) {
    case "hero": return { id, type, headline: "Judul Produk Anda", subheadline: "Deskripsi singkat yang menarik", image_url: "", cta_text: "Pesan Sekarang", cta_type: "scroll", cta_url: "" };
    case "benefits": return { id, type, title: "Kenapa Pilih Produk Ini?", items: [{ emoji: "✅", title: "Keunggulan 1", description: "Deskripsi keunggulan" }, { emoji: "🚀", title: "Keunggulan 2", description: "Deskripsi keunggulan" }, { emoji: "💎", title: "Keunggulan 3", description: "Deskripsi keunggulan" }] };
    case "gallery": return { id, type, title: "Foto Produk", images: [] };
    case "testimonials": return { id, type, title: "Kata Mereka", items: [{ name: "Pembeli 1", rating: 5, text: "Produk bagus, pengiriman cepat!", avatar_url: "" }] };
    case "pricing": return { id, type, original_price: 200000, sale_price: 150000, currency: "Rp", badge: "Hemat 25%", note: "Belum termasuk ongkos kirim" };
    case "video": return { id, type, title: "Video Produk", youtube_url: "" };
    case "faq": return { id, type, title: "Pertanyaan Umum", items: [{ question: "Berapa lama pengiriman?", answer: "Estimasi 2-5 hari kerja tergantung kurir dan lokasi." }] };
    case "cta": return { id, type, headline: "Dapatkan Sekarang!", subtitle: "Stok terbatas, jangan sampai kehabisan.", cta_text: "Pesan Sekarang", cta_type: "scroll", cta_url: "" };
    case "checkout": return { id, type, title: "Form Pemesanan", product_name: "Nama Produk", price: 0, weight_gram: 500, origin_area_id: "", origin_area_label: "", whatsapp_number: "", message_template: "Halo, saya ingin memesan:\nProduk: {product_name}\nNama: {name}\nHP: {phone}\nAlamat: {address}\nKurir: {courier} - {shipping_cost}\nTotal: {total}" };
  }
}
