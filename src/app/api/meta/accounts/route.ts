import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok, created } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";
import { listMetaAccounts, createMetaAccount } from "@/lib/data/meta-accounts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorize(request, ["ad_spend:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const accounts = await listMetaAccounts();
  return ok(accounts);
}

const createSchema = z.object({
  name: z.string().min(1),
  ad_account_id: z.string().min(1),
  access_token: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await authorize(request, ["ad_spend:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = await parseJson(request, createSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const account = await createMetaAccount(parsed.data);
    return created(account);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("unique")) return errors.conflict("Ad Account ID sudah terdaftar.");
    return errors.server(msg);
  }
}
