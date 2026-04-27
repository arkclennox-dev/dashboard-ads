import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { revokeApiKey } from "@/lib/data/api-keys";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["api_keys:manage"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const okRevoke = await revokeApiKey(params.id);
  if (!okRevoke) return errors.notFound("API key not found");
  return ok({ id: params.id, revoked: true });
}
