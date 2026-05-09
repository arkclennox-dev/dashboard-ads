import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type {
  AffiliateProduct,
  LandingPage,
  LandingPageProduct,
  LandingPageStatus,
} from "@/lib/types";

export interface LandingPageWithProducts extends LandingPage {
  products: Array<{
    product_id: string;
    sort_order: number;
    custom_title: string | null;
    custom_description: string | null;
    custom_cta: string;
    product?: AffiliateProduct | null;
  }>;
}

export interface ListLandingPagesArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: LandingPageStatus;
  sort?: "created_at" | "title";
  order?: "asc" | "desc";
}

export async function listLandingPages(args: ListLandingPagesArgs): Promise<{
  items: LandingPage[];
  total: number;
}> {
  const page = args.page ?? 1;
  const pageSize = args.pageSize ?? 25;
  if (isDemoMode) {
    const store = getDemoStore();
    let items = [...store.landingPages];
    if (args.q) {
      const q = args.q.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (args.status) items = items.filter((p) => p.status === args.status);
    items.sort((a, b) =>
      (args.order ?? "desc") === "asc"
        ? a.created_at.localeCompare(b.created_at)
        : b.created_at.localeCompare(a.created_at),
    );
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total };
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return { items: [], total: 0 };
  let query = supabase
    .from("landing_pages")
    .select("*", { count: "exact" })
    .order(args.sort ?? "created_at", { ascending: (args.order ?? "desc") === "asc" });
  if (args.q) query = query.ilike("title", `%${args.q}%`);
  if (args.status) query = query.eq("status", args.status);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  return { items: (data ?? []) as LandingPage[], total: count ?? (data?.length ?? 0) };
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPageWithProducts | null> {
  if (isDemoMode) {
    const store = getDemoStore();
    const lp = store.landingPages.find((p) => p.slug === slug);
    if (!lp) return null;
    const products = store.landingPageProducts
      .filter((lpp) => lpp.landing_page_id === lp.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((lpp) => ({
        product_id: lpp.product_id,
        sort_order: lpp.sort_order,
        custom_title: lpp.custom_title,
        custom_description: lpp.custom_description,
        custom_cta: lpp.custom_cta,
        product: store.products.find((p) => p.id === lpp.product_id) ?? null,
      }));
    return { ...lp, products };
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data: lp } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!lp) return null;
  const { data: lpp } = await supabase
    .from("landing_page_products")
    .select("product_id, sort_order, custom_title, custom_description, custom_cta")
    .eq("landing_page_id", (lp as LandingPage).id)
    .order("sort_order", { ascending: true });
  const ids = (lpp ?? []).map((row: { product_id: string }) => row.product_id);
  let products: AffiliateProduct[] = [];
  if (ids.length > 0) {
    const { data: prods } = await supabase
      .from("affiliate_products")
      .select("*")
      .in("id", ids);
    products = (prods ?? []) as AffiliateProduct[];
  }
  return {
    ...(lp as LandingPage),
    products: (lpp ?? []).map((row: Omit<LandingPageProduct, "id" | "landing_page_id" | "created_at">) => ({
      product_id: row.product_id,
      sort_order: row.sort_order,
      custom_title: row.custom_title,
      custom_description: row.custom_description,
      custom_cta: row.custom_cta,
      product: products.find((p) => p.id === row.product_id) ?? null,
    })),
  };
}

export async function getLandingPageById(id: string): Promise<LandingPage | null> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data } = await supabase.from("landing_pages").select("*").eq("id", id).maybeSingle();
  return (data as LandingPage | null) ?? null;
}

export interface UpdateLandingPageArgs {
  title?: string;
  slug?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  sections?: import("@/lib/types/sections").LandingPageSection[];
  page_settings?: import("@/lib/types/sections").PageSettings;
  status?: LandingPageStatus;
}

export async function updateLandingPage(id: string, args: UpdateLandingPageArgs): Promise<LandingPage | null> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("landing_pages")
    .update({ ...args, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as LandingPage | null) ?? null;
}

export interface CreateLandingPageArgs {
  title: string;
  slug: string;
  intro?: string | null;
  content?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  featured_image_url?: string | null;
  disclosure_text?: string | null;
  status?: LandingPageStatus;
  custom_head_script?: string | null;
  custom_body_script?: string | null;
  products?: Array<{
    product_id: string;
    sort_order?: number;
    custom_title?: string | null;
    custom_description?: string | null;
    custom_cta?: string;
  }>;
}

export async function createLandingPage(args: CreateLandingPageArgs): Promise<LandingPage> {
  if (isDemoMode) {
    const store = getDemoStore();
    if (store.landingPages.some((p) => p.slug === args.slug)) {
      throw Object.assign(new Error("Slug already exists"), { code: "CONFLICT" });
    }
    const now = new Date().toISOString();
    const lp: LandingPage = {
      id: randomUUID(),
      title: args.title,
      slug: args.slug,
      intro: args.intro ?? null,
      content: args.content ?? null,
      meta_title: args.meta_title ?? null,
      meta_description: args.meta_description ?? null,
      featured_image_url: args.featured_image_url ?? null,
      disclosure_text: args.disclosure_text ?? null,
      status: args.status ?? "draft",
      custom_head_script: args.custom_head_script ?? null,
      custom_body_script: args.custom_body_script ?? null,
      sections: [],
      page_settings: {} as import("@/lib/types/sections").PageSettings,
      created_at: now,
      updated_at: now,
    };
    store.landingPages.push(lp);
    (args.products ?? []).forEach((row, i) => {
      store.landingPageProducts.push({
        id: randomUUID(),
        landing_page_id: lp.id,
        product_id: row.product_id,
        sort_order: row.sort_order ?? i + 1,
        custom_title: row.custom_title ?? null,
        custom_description: row.custom_description ?? null,
        custom_cta: row.custom_cta ?? "Cek di Shopee",
        created_at: now,
      });
    });
    return lp;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("landing_pages")
    .insert({
      title: args.title,
      slug: args.slug,
      intro: args.intro,
      content: args.content,
      meta_title: args.meta_title,
      meta_description: args.meta_description,
      featured_image_url: args.featured_image_url,
      disclosure_text: args.disclosure_text,
      status: args.status ?? "draft",
      custom_head_script: args.custom_head_script,
      custom_body_script: args.custom_body_script,
    })
    .select("*")
    .single();
  if (error) throw error;
  const lp = data as LandingPage;
  if (args.products && args.products.length > 0) {
    await supabase.from("landing_page_products").insert(
      args.products.map((p, i) => ({
        landing_page_id: lp.id,
        product_id: p.product_id,
        sort_order: p.sort_order ?? i + 1,
        custom_title: p.custom_title ?? null,
        custom_description: p.custom_description ?? null,
        custom_cta: p.custom_cta ?? "Cek di Shopee",
      })),
    );
  }
  return lp;
}

export async function setLandingPageStatus(
  id: string,
  status: LandingPageStatus,
): Promise<LandingPage | null> {
  if (isDemoMode) {
    const store = getDemoStore();
    const idx = store.landingPages.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    store.landingPages[idx] = {
      ...store.landingPages[idx],
      status,
      updated_at: new Date().toISOString(),
    };
    return store.landingPages[idx];
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data } = await supabase
    .from("landing_pages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  return (data as LandingPage | null) ?? null;
}

export async function deleteLandingPage(id: string): Promise<boolean> {
  if (isDemoMode) {
    const store = getDemoStore();
    const before = store.landingPages.length;
    store.landingPages = store.landingPages.filter((p) => p.id !== id);
    store.landingPageProducts = store.landingPageProducts.filter(
      (p) => p.landing_page_id !== id,
    );
    return store.landingPages.length < before;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return false;
  const { error } = await supabase.from("landing_pages").delete().eq("id", id);
  return !error;
}
