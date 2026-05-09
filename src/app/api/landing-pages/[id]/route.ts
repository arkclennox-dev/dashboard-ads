import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { deleteLandingPage, updateLandingPage } from "@/lib/data/landing-pages";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  sections: z.array(z.record(z.unknown())).optional(),
  page_settings: z.record(z.unknown()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize(request, ["landing_pages:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, patchSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const updated = await updateLandingPage(params.id, parsed.data as Parameters<typeof updateLandingPage>[1]);
    if (!updated) return errors.notFound("Landing page not found");
    revalidatePath("/landing-pages");
    revalidatePath(`/lp/${updated.slug}`);
    return ok(updated);
  } catch (err) {
    return errors.server((err as Error).message);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize(request, ["landing_pages:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const deleted = await deleteLandingPage(params.id);
  if (!deleted) return errors.notFound("Landing page not found");
  revalidatePath("/landing-pages");
  return ok({ id: params.id, deleted: true });
}
