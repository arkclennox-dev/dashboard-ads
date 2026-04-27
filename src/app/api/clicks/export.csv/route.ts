import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/validate";
import { listClicks } from "@/lib/data/clicks";

export const dynamic = "force-dynamic";

const schema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  product_id: z.string().optional(),
  landing_page_id: z.string().optional(),
  utm_source: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  include_bots: z.coerce.boolean().default(false),
  include_duplicates: z.coerce.boolean().default(false),
});

const HEADERS = [
  "id",
  "created_at",
  "product_id",
  "product_slug",
  "landing_page_slug",
  "redirect_slug",
  "destination_url",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
  "device_type",
  "is_duplicate",
  "is_bot",
];

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  const auth = await authorize(request, ["clicks:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = parseQuery(new URL(request.url), schema);
  if (!parsed.ok) return parsed.response;

  const { items } = await listClicks({
    ...parsed.data,
    page: 1,
    pageSize: 5000,
  });

  const lines = [HEADERS.join(",")];
  for (const c of items) {
    lines.push(
      HEADERS.map((h) => escapeCsv((c as unknown as Record<string, unknown>)[h])).join(","),
    );
  }
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="clicks.csv"`,
    },
  });
}
