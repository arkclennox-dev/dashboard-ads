import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { MetaAdAccount } from "@/lib/types";

export async function listMetaAccounts(): Promise<MetaAdAccount[]> {
  if (isDemoMode) return [];
  const supabase = getSupabaseServiceRole();
  if (!supabase) return [];
  const { data } = await supabase
    .from("meta_ad_accounts")
    .select("*")
    .order("created_at", { ascending: true });
  return (data ?? []) as MetaAdAccount[];
}

export async function listActiveMetaAccounts(): Promise<MetaAdAccount[]> {
  if (isDemoMode) return [];
  const supabase = getSupabaseServiceRole();
  if (!supabase) return [];
  const { data } = await supabase
    .from("meta_ad_accounts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  return (data ?? []) as MetaAdAccount[];
}

export interface CreateMetaAccountArgs {
  name: string;
  ad_account_id: string;
  access_token: string;
}

export async function createMetaAccount(args: CreateMetaAccountArgs): Promise<MetaAdAccount> {
  if (isDemoMode) {
    const now = new Date().toISOString();
    return {
      id: randomUUID(),
      name: args.name,
      ad_account_id: args.ad_account_id,
      access_token: args.access_token,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const adAccountId = args.ad_account_id.startsWith("act_")
    ? args.ad_account_id
    : `act_${args.ad_account_id}`;
  const { data, error } = await supabase
    .from("meta_ad_accounts")
    .insert({ name: args.name, ad_account_id: adAccountId, access_token: args.access_token })
    .select("*")
    .single();
  if (error) throw error;
  return data as MetaAdAccount;
}

export async function updateMetaAccount(
  id: string,
  args: Partial<Pick<MetaAdAccount, "name" | "ad_account_id" | "access_token" | "is_active">>,
): Promise<MetaAdAccount> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("meta_ad_accounts")
    .update({ ...args, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as MetaAdAccount;
}

export async function deleteMetaAccount(id: string): Promise<void> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("meta_ad_accounts").delete().eq("id", id);
  if (error) throw error;
}
