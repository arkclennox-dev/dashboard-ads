import { z } from "zod";
import { authorize, type AuthScope } from "@/lib/api/auth";
import { errors, ok, created } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { createApiKey, listApiKeys } from "@/lib/data/api-keys";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorize(request, ["api_keys:manage"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const items = await listApiKeys();
  return ok(items);
}

const SCOPE_VALUES = [
  "read",
  "products:read",
  "products:write",
  "landing_pages:read",
  "landing_pages:write",
  "clicks:read",
  "clicks:write",
  "ad_spend:read",
  "ad_spend:write",
  "reports:read",
  "settings:read",
  "settings:write",
  "api_keys:manage",
] as const satisfies readonly AuthScope[];

const createSchema = z.object({
  name: z.string().min(1).max(80),
  scopes: z.array(z.enum(SCOPE_VALUES)).min(1),
});

export async function POST(request: Request) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["api_keys:manage"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, createSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const { row, rawKey } = await createApiKey({
      name: parsed.data.name,
      scopes: parsed.data.scopes,
    });
    return created({ ...row, key: rawKey });
  } catch (err) {
    return errors.server((err as Error).message);
  }
}
