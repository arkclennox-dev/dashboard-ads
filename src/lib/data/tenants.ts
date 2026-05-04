import { isDemoMode } from "@/lib/env";
import { getSupabaseServer, getSupabaseServiceRole } from "@/lib/supabase/server";

export async function getTenantId(): Promise<string | null> {
  if (isDemoMode) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getTenantIdForUser(user.id);
}

export async function getTenantIdForUser(userId: string): Promise<string | null> {
  const sb = getSupabaseServiceRole();
  if (!sb) return null;
  const { data } = await sb
    .from("tenants")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  if (isDemoMode) return true;
  const supabase = getSupabaseServer();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const sb = getSupabaseServiceRole();
  if (!sb) return false;
  const { data } = await sb
    .from("tenants")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.is_admin === true;
}
