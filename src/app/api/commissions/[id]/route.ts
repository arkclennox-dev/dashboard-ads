import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { deleteCommission } from "@/lib/data/commissions";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize(request, ["reports:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const deleted = await deleteCommission(params.id);
  if (!deleted) return errors.notFound("Commission report not found");
  revalidatePath("/admin");
  revalidatePath("/admin/komisi");
  return ok({ id: params.id, deleted: true });
}
