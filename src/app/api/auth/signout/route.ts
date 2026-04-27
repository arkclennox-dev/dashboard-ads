import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

async function handle(): Promise<Response> {
  const supabase = getSupabaseServer();
  if (supabase) {
    await supabase.auth.signOut();
  }
  const url = new URL("/admin/login", env.siteUrl || "http://localhost:3000");
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(): Promise<Response> {
  return handle();
}

export async function POST(): Promise<Response> {
  return handle();
}
