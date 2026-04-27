import { isDemoMode } from "@/lib/env";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { generateApiKey, hashApiKey, type AuthScope } from "@/lib/api/auth";

export interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  status: "active" | "revoked";
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  if (isDemoMode) return [];
  const supabase = getSupabaseServiceRole();
  if (!supabase) return [];
  const { data } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, status, last_used_at, expires_at, created_at, updated_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as ApiKeyRow[];
}

export async function createApiKey(input: {
  name: string;
  scopes: AuthScope[];
}): Promise<{ row: ApiKeyRow; rawKey: string }> {
  if (isDemoMode) {
    throw new Error("Demo mode: cannot create real API keys");
  }
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    throw new Error("Service role key not configured");
  }
  const { raw, prefix } = generateApiKey();
  const key_hash = hashApiKey(raw);
  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      name: input.name,
      key_prefix: prefix,
      key_hash,
      scopes: input.scopes,
      status: "active",
    })
    .select("id, name, key_prefix, scopes, status, last_used_at, expires_at, created_at, updated_at")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create API key");
  }
  return { row: data as ApiKeyRow, rawKey: raw };
}

export async function revokeApiKey(id: string): Promise<boolean> {
  if (isDemoMode) return false;
  const supabase = getSupabaseServiceRole();
  if (!supabase) return false;
  const { error } = await supabase
    .from("api_keys")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}
