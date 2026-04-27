import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, isDemoMode } from "@/lib/env";

export function getSupabaseServer(): SupabaseClient | null {
  if (isDemoMode) return null;
  const cookieStore = cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // ignore in route handlers where cookies are read-only
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // ignore
        }
      },
    },
  });
}

export function getSupabaseServiceRole(): SupabaseClient | null {
  if (isDemoMode || !env.supabaseServiceRoleKey) return null;
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
