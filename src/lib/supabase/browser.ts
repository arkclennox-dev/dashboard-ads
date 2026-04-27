"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, isDemoMode } from "@/lib/env";

export function getSupabaseBrowser() {
  if (isDemoMode) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
