import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok, noContent } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { updateMetaAccount, deleteMetaAccount } from "@/lib/data/meta-accounts";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  access_token: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, patchSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const account = await updateMetaAccount(params.id, parsed.data);
    return ok(account);
  } catch (err) {
    return errors.server((err as Error).message);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  try {
    await deleteMetaAccount(params.id);
    return noContent();
  } catch (err) {
    return errors.server((err as Error).message);
  }
}
