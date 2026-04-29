import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { CommissionReport } from "@/lib/types";

export interface ListCommissionsArgs {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
}

export interface CreateCommissionArgs {
  report_date: string;
  klik: number;
  pesanan: number;
  komisi: number;
  pembelian: number;
  produk_terjual: number;
  notes?: string | null;
}

export async function listCommissions(
  args: ListCommissionsArgs = {},
): Promise<{ items: CommissionReport[]; total: number }> {
  const page = args.page ?? 1;
  const pageSize = args.pageSize ?? 50;

  if (isDemoMode) {
    const store = getDemoStore();
    let items = [...store.commissions];
    if (args.from) items = items.filter((c) => c.report_date >= args.from!);
    if (args.to) items = items.filter((c) => c.report_date <= args.to!);
    items.sort((a, b) => b.report_date.localeCompare(a.report_date));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total };
  }

  const supabase = getSupabaseServiceRole();
  if (!supabase) return { items: [], total: 0 };
  let query = supabase
    .from("commission_reports")
    .select("*", { count: "exact" })
    .order("report_date", { ascending: false });
  if (args.from) query = query.gte("report_date", args.from);
  if (args.to) query = query.lte("report_date", args.to);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  return {
    items: (data ?? []) as CommissionReport[],
    total: count ?? (data?.length ?? 0),
  };
}

export async function createCommission(
  args: CreateCommissionArgs,
): Promise<CommissionReport> {
  if (isDemoMode) {
    const store = getDemoStore();
    const now = new Date().toISOString();
    const row: CommissionReport = {
      id: randomUUID(),
      report_date: args.report_date,
      klik: args.klik,
      pesanan: args.pesanan,
      komisi: args.komisi,
      pembelian: args.pembelian,
      produk_terjual: args.produk_terjual,
      notes: args.notes ?? null,
      created_at: now,
      updated_at: now,
    };
    store.commissions.push(row);
    return row;
  }

  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("commission_reports")
    .insert({
      report_date: args.report_date,
      klik: args.klik,
      pesanan: args.pesanan,
      komisi: args.komisi,
      pembelian: args.pembelian,
      produk_terjual: args.produk_terjual,
      notes: args.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as CommissionReport;
}

export async function deleteCommission(id: string): Promise<boolean> {
  if (isDemoMode) {
    const store = getDemoStore();
    const before = store.commissions.length;
    store.commissions = store.commissions.filter((c) => c.id !== id);
    return store.commissions.length < before;
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) return false;
  const { error } = await supabase.from("commission_reports").delete().eq("id", id);
  return !error;
}
