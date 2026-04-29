import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok, created } from "@/lib/api/response";
import { parseJson, parseQuery } from "@/lib/api/validate";
import { createCommission, listCommissions } from "@/lib/data/commissions";

export const dynamic = "force-dynamic";

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await authorize(request, ["reports:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = parseQuery(new URL(request.url), listSchema);
  if (!parsed.ok) return parsed.response;
  const { items, total } = await listCommissions(parsed.data);
  return ok(items, { page: parsed.data.page, pageSize: parsed.data.pageSize, total });
}

const createSchema = z.object({
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  klik: z.number().int().nonnegative(),
  pesanan: z.number().int().nonnegative(),
  komisi: z.number().nonnegative(),
  pembelian: z.number().nonnegative(),
  produk_terjual: z.number().int().nonnegative(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const auth = await authorize(request, ["reports:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, createSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const row = await createCommission(parsed.data);
    revalidatePath("/admin");
    revalidatePath("/admin/komisi");
    return created(row);
  } catch (err) {
    return errors.server((err as Error).message);
  }
}
