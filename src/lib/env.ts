export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  apiKeySecret: process.env.API_KEY_SECRET || "",
  metaAccessToken: process.env.META_ACCESS_TOKEN || "",
  metaAdAccountId: process.env.META_AD_ACCOUNT_ID || "",
};

export const isDemoMode = !env.supabaseUrl || !env.supabaseAnonKey;
