import { searchAreas } from "@/lib/biteship";
import { ok, errors } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length < 3) return ok([]);
  const { areas, error } = await searchAreas(q);
  if (error) return errors.server(error);
  return ok(areas);
}
