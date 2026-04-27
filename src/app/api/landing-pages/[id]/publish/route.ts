import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { setLandingPageStatus } from "@/lib/data/landing-pages";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (isDemoMode) return errors.demoReadOnly();
  const auth = await authorize(request, ["landing_pages:write"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const lp = await setLandingPageStatus(params.id, "published");
  if (!lp) return errors.notFound("Landing page not found");
  return ok(lp);
}
