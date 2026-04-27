import { z } from "zod";
import { authorize } from "@/lib/api/auth";
import { errors, ok } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/validate";
import { listClicks } from "@/lib/data/clicks";
import { listAdSpend } from "@/lib/data/ad-spend";

export const dynamic = "force-dynamic";

const schema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await authorize(request, ["reports:read"]);
  if (!auth.ok) return errors.unauthorized(auth.message);
  const parsed = parseQuery(new URL(request.url), schema);
  if (!parsed.ok) return parsed.response;
  const { from, to, utm_campaign } = parsed.data;

  const { items: allClicks } = await listClicks({
    page: 1,
    pageSize: 10000,
    from,
    to,
    utm_campaign,
    include_bots: true,
    include_duplicates: true,
  });
  const { items: spend } = await listAdSpend({
    page: 1,
    pageSize: 10000,
    from,
    to,
    utm_campaign,
  });

  const redirectClicks = allClicks.length;
  const botClicks = allClicks.filter((c) => c.is_bot).length;
  const dupClicks = allClicks.filter((c) => c.is_duplicate).length;
  const nonDup = allClicks.filter((c) => !c.is_duplicate && !c.is_bot).length;
  const totalSpend = spend.reduce((s, r) => s + r.spend, 0);
  const impressions = spend.reduce((s, r) => s + r.impressions, 0);
  const metaLinkClicks = spend.reduce((s, r) => s + r.link_clicks, 0);
  const metaLpv = spend.reduce((s, r) => s + r.landing_page_views, 0);

  const safe = (n: number, d: number) => (d === 0 ? 0 : n / d);

  return ok({
    redirect_clicks: redirectClicks,
    non_duplicate_clicks: nonDup,
    bot_clicks: botClicks,
    duplicate_clicks: dupClicks,
    spend: Number(totalSpend.toFixed(2)),
    impressions,
    meta_link_clicks: metaLinkClicks,
    meta_landing_page_views: metaLpv,
    cost_per_redirect_click: Number(safe(totalSpend, redirectClicks).toFixed(2)),
    cost_per_non_duplicate_click: Number(safe(totalSpend, nonDup).toFixed(2)),
    meta_cpc: Number(safe(totalSpend, metaLinkClicks).toFixed(2)),
    click_gap: metaLinkClicks - redirectClicks,
    duplicate_rate: Number(safe(dupClicks, redirectClicks).toFixed(4)),
    bot_rate: Number(safe(botClicks, redirectClicks).toFixed(4)),
  });
}
