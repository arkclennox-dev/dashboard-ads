import { ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    status: "ok",
    app: "Affiliate Click Dashboard",
    timestamp: new Date().toISOString(),
  });
}
