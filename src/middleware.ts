import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PUBLIC_ADMIN_PATHS = new Set<string>(["/admin/login", "/admin/register"]);

// User-facing routes (free tier) — require login but not admin
const USER_PATHS = ["/dashboard", "/landing-pages", "/clicks", "/panduan"];

// Admin-only routes — require is_admin = true
const ADMIN_ONLY_PREFIXES = [
  "/admin/dashboard-ads",
  "/admin/reports",
  "/admin/ad-spend",
  "/admin/meta-accounts",
  "/admin/komisi",
  "/admin/api-keys",
  "/admin/settings",
];

export async function middleware(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return req.cookies.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) {
        req.cookies.set({ name, value, ...options });
        res = NextResponse.next({ request: { headers: req.headers } });
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        req.cookies.set({ name, value: "", ...options });
        res = NextResponse.next({ request: { headers: req.headers } });
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.has(path);

  // Protect user-facing routes — must be logged in
  const isUserPath = USER_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  if (isUserPath && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Protect admin routes — must be logged in
  if (path.startsWith("/admin") && !isPublicAdminPath && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in user away from login page
  if (path === "/admin/login" && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Protect admin-only routes — require is_admin = true
  if (user && ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p))) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (serviceRoleKey) {
      const sb = createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: { get: () => undefined, set: () => {}, remove: () => {} },
        auth: { persistSession: false },
      });
      const { data: tenant } = await sb
        .from("tenants")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!tenant?.is_admin) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/landing-pages/:path*", "/clicks/:path*", "/panduan/:path*"],
};
