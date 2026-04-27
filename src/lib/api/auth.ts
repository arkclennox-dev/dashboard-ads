import { createHash, randomBytes } from "crypto";
import { env, isDemoMode } from "@/lib/env";
import { getSupabaseServer, getSupabaseServiceRole } from "@/lib/supabase/server";

export type AuthScope =
  | "read"
  | "products:read"
  | "products:write"
  | "landing_pages:read"
  | "landing_pages:write"
  | "clicks:read"
  | "clicks:write"
  | "ad_spend:read"
  | "ad_spend:write"
  | "reports:read"
  | "settings:read"
  | "settings:write"
  | "api_keys:manage";

export type AuthContext =
  | { kind: "session"; userId: string }
  | { kind: "api_key"; keyId: string; scopes: AuthScope[] }
  | { kind: "demo" };

export function hashApiKey(rawKey: string): string {
  const secret = env.apiKeySecret || "dev-secret";
  return createHash("sha256").update(`${secret}:${rawKey}`).digest("hex");
}

export function generateApiKey(prefix = "aff_live"): { raw: string; prefix: string } {
  const random = randomBytes(24).toString("base64url");
  const raw = `${prefix}_${random}`;
  return { raw, prefix: `${prefix}_${random.slice(0, 4)}` };
}

export async function authorize(
  request: Request,
  required: AuthScope[],
): Promise<{ ok: true; ctx: AuthContext } | { ok: false; status: number; message: string }> {
  if (isDemoMode) {
    return { ok: true, ctx: { kind: "demo" } };
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    const supabase = getSupabaseServiceRole();
    if (!supabase) {
      return { ok: false, status: 500, message: "Service role key not configured" };
    }
    const keyHash = hashApiKey(apiKey);
    const { data: keyRow, error: keyError } = await supabase
      .from("api_keys")
      .select("id, scopes, status, expires_at")
      .eq("key_hash", keyHash)
      .maybeSingle();
    if (keyError || !keyRow) {
      return { ok: false, status: 401, message: "Invalid API key" };
    }
    if (keyRow.status !== "active") {
      return { ok: false, status: 401, message: "API key revoked" };
    }
    if (keyRow.expires_at && new Date(keyRow.expires_at) < new Date()) {
      return { ok: false, status: 401, message: "API key expired" };
    }
    const scopes = (keyRow.scopes ?? []) as AuthScope[];
    if (!hasAllScopes(scopes, required)) {
      return { ok: false, status: 403, message: "Insufficient scope" };
    }
    void supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyRow.id);
    return {
      ok: true,
      ctx: { kind: "api_key", keyId: keyRow.id, scopes },
    };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return { ok: false, status: 500, message: "Supabase not configured" };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, status: 401, message: "Authentication required" };
  }
  return { ok: true, ctx: { kind: "session", userId: user.id } };
}

export function hasAllScopes(have: AuthScope[], required: AuthScope[]): boolean {
  if (required.length === 0) return true;
  if (have.includes("read") && required.every((s) => s.endsWith(":read") || s === "read")) {
    return true;
  }
  return required.every((s) => have.includes(s));
}
