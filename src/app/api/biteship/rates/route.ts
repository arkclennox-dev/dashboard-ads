import { z } from "zod";
import { getRates } from "@/lib/biteship";
import { ok, errors } from "@/lib/api/response";
import { parseJson } from "@/lib/api/validate";

export const dynamic = "force-dynamic";

const schema = z.object({
  origin_area_id: z.string().min(1),
  destination_area_id: z.string().min(1),
  weight_gram: z.number().int().min(1),
  item_value: z.number().min(0),
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, schema);
  if (!parsed.ok) return parsed.response;
  const { rates, error } = await getRates(parsed.data);
  if (error) return errors.server(error);
  return ok(rates);
}
