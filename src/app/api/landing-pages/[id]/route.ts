import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { deleteLandingPage } from "@/lib/data/landing-pages";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize(request, ["landing_pages:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const deleted = await deleteLandingPage(params.id);
  if (!deleted) return errors.notFound("Landing page not found");
  revalidatePath("/admin");
  revalidatePath("/admin/landing-pages");
  return ok({ id: params.id, deleted: true });
}
