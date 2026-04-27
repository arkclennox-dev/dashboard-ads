import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { getSettings, updateSettings } from "@/lib/data/settings";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorize(request, ["settings:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const settings = await getSettings();
  return ok(settings);
}

const patchSchema = z.object({
  site_name: z.string().optional(),
  site_url: z.string().url().optional().nullable(),
  default_disclosure_text: z.string().optional(),
  meta_pixel_id: z.string().optional().nullable(),
  ga4_measurement_id: z.string().optional().nullable(),
  global_head_script: z.string().optional().nullable(),
  global_body_script: z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["settings:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, patchSchema);
  if (!parsed.ok) return parsed.response;
  const settings = await updateSettings(parsed.data);
  return ok(settings);
}
