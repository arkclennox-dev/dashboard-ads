const META_GRAPH_VERSION = "v20.0";
const BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export interface MetaInsightRow {
  report_date: string;
  campaign_name: string;
  adset_name: string | null;
  ad_name: string | null;
  spend: number;
  impressions: number;
  link_clicks: number;
  landing_page_views: number;
}

interface MetaAction {
  action_type: string;
  value: string;
}

interface MetaRawRow {
  date_start: string;
  campaign_name: string;
  adset_name?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  inline_link_clicks?: string;
  actions?: MetaAction[];
}

interface MetaApiResponse {
  data: MetaRawRow[];
  paging?: { next?: string };
  error?: { message: string; type: string; code: number };
}

export async function fetchMetaInsights(args: {
  accessToken: string;
  adAccountId: string;
  since: string;
  until: string;
}): Promise<MetaInsightRow[]> {
  const { accessToken, adAccountId, since, until } = args;
  const accountId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

  const params = new URLSearchParams({
    fields: "campaign_name,adset_name,ad_name,spend,impressions,inline_link_clicks,actions",
    time_range: JSON.stringify({ since, until }),
    time_increment: "1",
    level: "ad",
    access_token: accessToken,
    limit: "500",
  });

  const results: MetaInsightRow[] = [];
  let url: string | null = `${BASE_URL}/${accountId}/insights?${params}`;

  while (url) {
    const res = await fetch(url, { cache: "no-store" });
    const json: MetaApiResponse = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error?.message ?? `Meta API error: ${res.status}`);
    }

    for (const row of json.data ?? []) {
      const lpvAction = (row.actions ?? []).find(
        (a) => a.action_type === "landing_page_view",
      );
      results.push({
        report_date: row.date_start,
        campaign_name: row.campaign_name ?? "",
        adset_name: row.adset_name ?? null,
        ad_name: row.ad_name ?? null,
        spend: parseFloat(row.spend ?? "0"),
        impressions: parseInt(row.impressions ?? "0", 10),
        link_clicks: parseInt(row.inline_link_clicks ?? "0", 10),
        landing_page_views: lpvAction ? parseInt(lpvAction.value, 10) : 0,
      });
    }

    url = json.paging?.next ?? null;
  }

  return results;
}
