import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, isDemoMode } from "@/lib/env";

export function getSupabaseServer(): SupabaseClient | null {
  if (isDemoMode) return null;
  const cookieStore = cookies();
  const noStoreFetch: typeof fetch = (input, init) =>
    fetch(input, { ...(init ?? {}), cache: "no-store" });
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { fetch: noStoreFetch },
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
  // Wrap fetch with `cache: "no-store"` so Next.js' default Data Cache
  // doesn't serve stale rows on Server Components after writes.
  const noStoreFetch: typeof fetch = (input, init) =>
    fetch(input, { ...(init ?? {}), cache: "no-store" });
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: noStoreFetch },
  });
}
