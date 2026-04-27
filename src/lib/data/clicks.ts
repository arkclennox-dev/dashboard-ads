import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { ClickEvent } from "@/lib/types";

export interface InsertClickArgs {
  product_id: string | null;
  product_slug: string | null;
  redirect_slug: string | null;
  destination_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  device_type: string | null;
  is_duplicate: boolean;
  is_bot: boolean;
  landing_page_id?: string | null;
  landing_page_slug?: string | null;
}

export async function insertClick(args: InsertClickArgs): Promise<ClickEvent> {
  if (isDemoMode) {
    const store = getDemoStore();
    const event: ClickEvent = {
      id: randomUUID(),
      product_id: args.product_id,
      landing_page_id: args.landing_page_id ?? null,
      product_slug: args.product_slug,
      landing_page_slug: args.landing_page_slug ?? null,
      redirect_slug: args.redirect_slug,
      destination_url: args.destination_url,
      utm_source: args.utm_source,
      utm_medium: args.utm_medium,
      utm_campaign: args.utm_campaign,
      utm_content: args.utm_content,
      utm_term: args.utm_term,
      referrer: args.referrer,
      user_agent: args.user_agent,
      ip_hash: args.ip_hash,
      country: null,
      device_type: args.device_type,
      browser: null,
      os: null,
      is_duplicate: args.is_duplicate,
      is_bot: args.is_bot,
      created_at: new Date().toISOString(),
    };
    store.clicks.push(event);
    return event;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("click_events")
    .insert(args)
    .select("*")
    .single();
  if (error) throw error;
  return data as ClickEvent;
}

export interface RecentDuplicateArgs {
  product_id: string;
  ip_hash: string | null;
  user_agent: string | null;
  windowMinutes?: number;
}

export async function isRecentDuplicate(args: RecentDuplicateArgs): Promise<boolean> {
  const windowMs = (args.windowMinutes ?? 10) * 60 * 1000;
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    return store.clicks.some(
      (c) =>
        c.product_id === args.product_id &&
        c.ip_hash === args.ip_hash &&
        c.user_agent === args.user_agent &&
        c.created_at > cutoff,
    );
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return false;
  if (!args.ip_hash) return false;
  const { data } = await supabase
    .from("click_events")
    .select("id")
    .eq("product_id", args.product_id)
    .eq("ip_hash", args.ip_hash)
    .gt("created_at", cutoff)
    .limit(1);
  return !!(data && data.length > 0);
}

export interface ListClicksArgs {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  product_id?: string;
  landing_page_id?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  include_bots?: boolean;
  include_duplicates?: boolean;
  sort?: "created_at";
  order?: "asc" | "desc";
}

export interface ListClicksResult {
  items: ClickEvent[];
  total: number;
}

export async function listClicks(args: ListClicksArgs): Promise<ListClicksResult> {
  const page = args.page ?? 1;
  const pageSize = args.pageSize ?? 50;
  if (isDemoMode) {
    const store = getDemoStore();
    let items = [...store.clicks];
    if (args.from) items = items.filter((c) => c.created_at >= args.from!);
    if (args.to) items = items.filter((c) => c.created_at <= `${args.to}T23:59:59.999Z`);
    if (args.product_id) items = items.filter((c) => c.product_id === args.product_id);
    if (args.landing_page_id)
      items = items.filter((c) => c.landing_page_id === args.landing_page_id);
    if (args.utm_source) items = items.filter((c) => c.utm_source === args.utm_source);
    if (args.utm_campaign) items = items.filter((c) => c.utm_campaign === args.utm_campaign);
    if (args.utm_content) items = items.filter((c) => c.utm_content === args.utm_content);
    if (args.utm_term) items = items.filter((c) => c.utm_term === args.utm_term);
    if (!args.include_bots) items = items.filter((c) => !c.is_bot);
    if (!args.include_duplicates) items = items.filter((c) => !c.is_duplicate);
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
    .from("click_events")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: (args.order ?? "desc") === "asc" });
  if (args.from) query = query.gte("created_at", args.from);
  if (args.to) query = query.lte("created_at", `${args.to}T23:59:59.999Z`);
  if (args.product_id) query = query.eq("product_id", args.product_id);
  if (args.landing_page_id) query = query.eq("landing_page_id", args.landing_page_id);
  if (args.utm_source) query = query.eq("utm_source", args.utm_source);
  if (args.utm_campaign) query = query.eq("utm_campaign", args.utm_campaign);
  if (args.utm_content) query = query.eq("utm_content", args.utm_content);
  if (args.utm_term) query = query.eq("utm_term", args.utm_term);
  if (!args.include_bots) query = query.eq("is_bot", false);
  if (!args.include_duplicates) query = query.eq("is_duplicate", false);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  return { items: (data ?? []) as ClickEvent[], total: count ?? (data?.length ?? 0) };
}
