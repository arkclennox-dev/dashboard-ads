import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseJson, slugSchema, urlSchema } from "@/lib/api/validate";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/data/products";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize(request, ["products:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const product = await getProductById(params.id);
  if (!product) return errors.notFound("Product not found");
  return ok(product);
}

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: slugSchema.optional(),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  destination_url: urlSchema.optional(),
  category: z.string().optional().nullable(),
  source_platform: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["products:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, patchSchema);
  if (!parsed.ok) return parsed.response;
  const product = await updateProduct(params.id, parsed.data);
  if (!product) return errors.notFound("Product not found");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return ok(product);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["products:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const url = new URL(request.url);
  const hard = url.searchParams.get("hard") === "true";
  const okDelete = await deleteProduct(params.id, hard);
  if (!okDelete) return errors.notFound("Product not found");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return ok({ id: params.id, deleted: true });
}
