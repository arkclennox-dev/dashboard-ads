import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { AffiliateProduct, ProductStatus } from "@/lib/types";

export interface ProductWithStats extends AffiliateProduct {
  total_clicks: number;
  redirect_url: string;
}

function withStats(p: AffiliateProduct, totalClicks: number, siteUrl: string): ProductWithStats {
  return {
    ...p,
    total_clicks: totalClicks,
    redirect_url: `${siteUrl.replace(/\/$/, "")}/go/${p.slug}`,
  };
}

export interface ListProductsArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: ProductStatus;
  category?: string;
  sourcePlatform?: string;
  sort?: "created_at" | "title" | "total_clicks";
  order?: "asc" | "desc";
}

export interface ListProductsResult {
  items: ProductWithStats[];
  total: number;
}

export async function listProducts(
  args: ListProductsArgs,
  siteUrl: string,
): Promise<ListProductsResult> {
  const page = args.page ?? 1;
  const pageSize = args.pageSize ?? 25;
  if (isDemoMode) {
    const store = getDemoStore();
    let items = [...store.products];
    if (args.q) {
      const q = args.q.toLowerCase();
      items = items.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
      );
    }
    if (args.status) items = items.filter((p) => p.status === args.status);
    if (args.category) items = items.filter((p) => p.category === args.category);
    if (args.sourcePlatform)
      items = items.filter((p) => p.source_platform === args.sourcePlatform);

    const clicksByProduct = new Map<string, number>();
    store.clicks.forEach((c) => {
      if (!c.product_id) return;
      clicksByProduct.set(c.product_id, (clicksByProduct.get(c.product_id) ?? 0) + 1);
    });

    const enriched = items.map((p) =>
      withStats(p, clicksByProduct.get(p.id) ?? 0, siteUrl),
    );
    const sortKey = args.sort ?? "created_at";
    const order = args.order ?? "desc";
    enriched.sort((a, b) => {
      const av = sortKey === "title" ? a.title : sortKey === "total_clicks" ? a.total_clicks : a.created_at;
      const bv = sortKey === "title" ? b.title : sortKey === "total_clicks" ? b.total_clicks : b.created_at;
      return order === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
    const total = enriched.length;
    const start = (page - 1) * pageSize;
    return { items: enriched.slice(start, start + pageSize), total };
  }

  const supabase = getSupabaseServiceRole();
  if (!supabase) return { items: [], total: 0 };
  const sortColumn = args.sort === "total_clicks" ? "created_at" : (args.sort ?? "created_at");
  let query = supabase
    .from("affiliate_products")
    .select("*", { count: "exact" })
    .order(sortColumn, { ascending: (args.order ?? "desc") === "asc" });
  if (args.q) query = query.ilike("title", `%${args.q}%`);
  if (args.status) query = query.eq("status", args.status);
  if (args.category) query = query.eq("category", args.category);
  if (args.sourcePlatform) query = query.eq("source_platform", args.sourcePlatform);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  const products = (data ?? []) as AffiliateProduct[];
  const ids = products.map((p) => p.id);
  let clicksByProduct = new Map<string, number>();
  if (ids.length > 0) {
    const { data: clickRows } = await supabase
      .from("click_events")
      .select("product_id")
      .in("product_id", ids);
    clicksByProduct = new Map();
    (clickRows ?? []).forEach((row: { product_id: string | null }) => {
      if (!row.product_id) return;
      clicksByProduct.set(row.product_id, (clicksByProduct.get(row.product_id) ?? 0) + 1);
    });
  }
  return {
    items: products.map((p) => withStats(p, clicksByProduct.get(p.id) ?? 0, siteUrl)),
    total: count ?? products.length,
  };
}

export async function getProductBySlug(slug: string): Promise<AffiliateProduct | null> {
  if (isDemoMode) {
    const store = getDemoStore();
    return store.products.find((p) => p.slug === slug) ?? null;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data } = await supabase
    .from("affiliate_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as AffiliateProduct | null) ?? null;
}

export async function getProductById(id: string): Promise<AffiliateProduct | null> {
  if (isDemoMode) {
    const store = getDemoStore();
    return store.products.find((p) => p.id === id) ?? null;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data } = await supabase
    .from("affiliate_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as AffiliateProduct | null) ?? null;
}

export interface CreateProductArgs {
  title: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  destination_url: string;
  category?: string | null;
  source_platform?: string;
  status?: ProductStatus;
  notes?: string | null;
}

export async function createProduct(args: CreateProductArgs): Promise<AffiliateProduct> {
  if (isDemoMode) {
    const store = getDemoStore();
    if (store.products.some((p) => p.slug === args.slug)) {
      throw Object.assign(new Error("Slug already exists"), { code: "CONFLICT" });
    }
    const now = new Date().toISOString();
    const product: AffiliateProduct = {
      id: randomUUID(),
      title: args.title,
      slug: args.slug,
      description: args.description ?? null,
      image_url: args.image_url ?? null,
      destination_url: args.destination_url,
      category: args.category ?? null,
      source_platform: args.source_platform ?? "shopee",
      status: args.status ?? "active",
      notes: args.notes ?? null,
      created_at: now,
      updated_at: now,
    };
    store.products.push(product);
    return product;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("affiliate_products")
    .insert({
      title: args.title,
      slug: args.slug,
      description: args.description,
      image_url: args.image_url,
      destination_url: args.destination_url,
      category: args.category,
      source_platform: args.source_platform ?? "shopee",
      status: args.status ?? "active",
      notes: args.notes,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as AffiliateProduct;
}

export async function updateProduct(
  id: string,
  patch: Partial<CreateProductArgs>,
): Promise<AffiliateProduct | null> {
  if (isDemoMode) {
    const store = getDemoStore();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const next = { ...store.products[idx], ...patch, updated_at: new Date().toISOString() };
    store.products[idx] = next;
    return next;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data } = await supabase
    .from("affiliate_products")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  return (data as AffiliateProduct | null) ?? null;
}

export async function deleteProduct(id: string, hard = false): Promise<boolean> {
  if (isDemoMode) {
    const store = getDemoStore();
    if (hard) {
      const before = store.products.length;
      store.products = store.products.filter((p) => p.id !== id);
      return store.products.length < before;
    }
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx < 0) return false;
    store.products[idx] = {
      ...store.products[idx],
      status: "inactive",
      updated_at: new Date().toISOString(),
    };
    return true;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return false;
  if (hard) {
    const { error } = await supabase.from("affiliate_products").delete().eq("id", id);
    return !error;
  }
  const { error } = await supabase
    .from("affiliate_products")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}
