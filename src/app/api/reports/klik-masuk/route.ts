import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { getTenantId } from "@/lib/data/tenants";
import { getSupabaseServiceRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({
  utm_campaign: z.string().min(1),
  klik_masuk: z.number().int().min(0),
});

export async function PATCH(request: Request) {
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);

  const parsed = await parseJson(request, schema);
  if (!parsed.ok) return parsed.response;

  const tenantId = await getTenantId();
  if (!tenantId) return errors.unauthorized("Not authenticated");

  const supabase = getSupabaseServiceRole();
  if (!supabase) return errors.server("Database unavailable");

  const { error } = await supabase
    .from("campaign_klik_masuk")
    .upsert(
      {
        tenant_id: tenantId,
        utm_campaign: parsed.data.utm_campaign,
        klik_masuk: parsed.data.klik_masuk,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,utm_campaign" },
    );

  if (error) return errors.server(error.message);
  return ok({ utm_campaign: parsed.data.utm_campaign, klik_masuk: parsed.data.klik_masuk });
}
