import Link from "next/link";

interface Endpoint {
  method: string;
  path: string;
  auth: string;
  desc: string;
}

const methodColor: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-brand-300",
  PATCH: "text-warn",
  DELETE: "text-danger",
};

const endpoints: Endpoint[] = [
  // Health
  { method: "GET",    path: "/api/health",                        auth: "Public",                        desc: "Service health check" },

  // Products / Redirect links
  { method: "GET",    path: "/api/products",                      auth: "API key (products:read)",        desc: "List all redirect products" },
  { method: "POST",   path: "/api/products",                      auth: "API key (products:write)",       desc: "Create a new redirect product" },
  { method: "GET",    path: "/api/products/[id]",                 auth: "API key (products:read)",        desc: "Get a single product" },
  { method: "PATCH",  path: "/api/products/[id]",                 auth: "API key (products:write)",       desc: "Update product" },
  { method: "DELETE", path: "/api/products/[id]",                 auth: "API key (products:write)",       desc: "Delete product" },

  // Redirects
  { method: "GET",    path: "/api/redirects",                     auth: "API key (products:read)",        desc: "List redirects with click counts" },
  { method: "GET",    path: "/api/redirects/[slug]",              auth: "API key (products:read)",        desc: "Redirect detail + stats" },

  // Clicks
  { method: "GET",    path: "/api/clicks",                        auth: "API key (clicks:read)",          desc: "List click events (paginated, filterable)" },
  { method: "GET",    path: "/api/clicks/export.csv",             auth: "API key (clicks:read)",          desc: "Export click events as CSV" },

  // Ad Spend
  { method: "GET",    path: "/api/ad-spend",                      auth: "API key (ad_spend:read)",        desc: "List ad spend reports" },
  { method: "POST",   path: "/api/ad-spend",                      auth: "API key (ad_spend:write)",       desc: "Create / upsert ad spend rows" },

  // Commissions
  { method: "GET",    path: "/api/commissions",                   auth: "API key (ad_spend:read)",        desc: "List commission reports" },
  { method: "PATCH",  path: "/api/commissions/[id]",              auth: "API key (ad_spend:write)",       desc: "Update a commission record" },
  { method: "DELETE", path: "/api/commissions/[id]",              auth: "API key (ad_spend:write)",       desc: "Delete a commission record" },

  // Meta Ads accounts
  { method: "GET",    path: "/api/meta/accounts",                 auth: "API key (settings:read)",        desc: "List Meta ad accounts" },
  { method: "POST",   path: "/api/meta/accounts",                 auth: "API key (settings:write)",       desc: "Add a Meta ad account" },
  { method: "PATCH",  path: "/api/meta/accounts/[id]",            auth: "API key (settings:write)",       desc: "Update Meta ad account (token, active)" },
  { method: "DELETE", path: "/api/meta/accounts/[id]",            auth: "API key (settings:write)",       desc: "Remove a Meta ad account" },
  { method: "POST",   path: "/api/meta/sync",                     auth: "API key (ad_spend:write)",       desc: "Sync ad spend from Meta Graph API" },

  // Landing pages
  { method: "GET",    path: "/api/landing-pages",                 auth: "API key (landing_pages:read)",   desc: "List landing pages" },
  { method: "POST",   path: "/api/landing-pages",                 auth: "API key (landing_pages:write)",  desc: "Create landing page" },
  { method: "GET",    path: "/api/landing-pages/[id]",            auth: "API key (landing_pages:read)",   desc: "Get landing page" },
  { method: "PATCH",  path: "/api/landing-pages/[id]",            auth: "API key (landing_pages:write)",  desc: "Update landing page" },
  { method: "DELETE", path: "/api/landing-pages/[id]",            auth: "API key (landing_pages:write)",  desc: "Delete landing page" },
  { method: "POST",   path: "/api/landing-pages/[id]/publish",    auth: "API key (landing_pages:write)",  desc: "Publish landing page" },
  { method: "POST",   path: "/api/landing-pages/[id]/unpublish",  auth: "API key (landing_pages:write)",  desc: "Unpublish landing page" },
  { method: "GET",    path: "/api/public/landing-pages/[slug]",   auth: "Public",                        desc: "Public landing page data (untuk embed)" },

  // Reports
  { method: "GET",    path: "/api/reports/overview",              auth: "API key (reports:read)",         desc: "Aggregate overview metrics" },

  // Settings
  { method: "GET",    path: "/api/settings",                      auth: "API key (settings:read)",        desc: "Read site settings" },
  { method: "PATCH",  path: "/api/settings",                      auth: "API key (settings:write)",       desc: "Update site settings" },

  // API Keys
  { method: "GET",    path: "/api/api-keys",                      auth: "Session (admin)",                desc: "List API keys (no secret shown)" },
  { method: "POST",   path: "/api/api-keys",                      auth: "Session (admin)",                desc: "Create new API key" },
  { method: "DELETE", path: "/api/api-keys/[id]",                 auth: "Session (admin)",                desc: "Revoke an API key" },
];

const groups: { title: string; paths: string[] }[] = [
  { title: "Products & Redirects", paths: ["/api/products", "/api/redirects"] },
  { title: "Clicks", paths: ["/api/clicks"] },
  { title: "Ad Spend & Commissions", paths: ["/api/ad-spend", "/api/commissions"] },
  { title: "Meta Ads", paths: ["/api/meta"] },
  { title: "Landing Pages", paths: ["/api/landing-pages", "/api/public"] },
  { title: "Reports & Settings", paths: ["/api/reports", "/api/settings"] },
  { title: "API Keys", paths: ["/api/api-keys"] },
  { title: "Health", paths: ["/api/health"] },
];

function groupFor(path: string) {
  return groups.find((g) => g.paths.some((p) => path.startsWith(p)))?.title ?? "Other";
}

export default function ApiDocsPage() {
  const grouped = groups.map((g) => ({
    title: g.title,
    rows: endpoints.filter((e) => groupFor(e.path) === g.title),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Header */}
      <div className="border-b border-border bg-surface-2">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">API Documentation</h1>
              <p className="mt-0.5 text-sm text-ink-2">
                Server-to-server endpoints untuk integrasi, otomasi, dan AI agents.
              </p>
            </div>
            <Link
              href="/admin"
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-3"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">

        {/* Auth section */}
        <div className="rounded-xl border border-border bg-surface-2 p-5">
          <h2 className="mb-3 text-sm font-semibold">Authentication</h2>
          <p className="mb-3 text-sm text-ink-2">
            Semua endpoint (kecuali yang bertanda <span className="font-semibold text-ink">Public</span>) memerlukan API key
            di header <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-brand-300">x-api-key</code>.
            Buat key di{" "}
            <Link href="/admin/api-keys" className="text-brand-300 hover:underline">
              /admin/api-keys
            </Link>.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-xs text-ink-2">
{`curl https://yourdomain.com/api/products \\
  -H "x-api-key: aff_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"`}
          </pre>
        </div>

        {/* Meta Sync example */}
        <div className="rounded-xl border border-border bg-surface-2 p-5">
          <h2 className="mb-1 text-sm font-semibold">Contoh: Sync Meta Ads</h2>
          <p className="mb-3 text-xs text-muted">
            Tarik data spend dari semua akun Meta aktif untuk rentang tanggal tertentu.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-xs text-ink-2">
{`curl -X POST https://yourdomain.com/api/meta/sync \\
  -H "x-api-key: aff_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"since": "2025-05-01", "until": "2025-05-07"}'`}
          </pre>
          <p className="mt-2 text-xs text-muted">
            Response: <code className="text-brand-300">{"{ since, until, total_synced, accounts: [{account, ad_account_id, synced, error?}] }"}</code>
          </p>
        </div>

        {/* Endpoint tables by group */}
        {grouped.map((g) => (
          <div key={g.title} className="rounded-xl border border-border bg-surface-2">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">{g.title}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted">
                  <tr className="border-b border-border [&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                    <th className="w-16">Method</th>
                    <th>Path</th>
                    <th className="w-52">Auth</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((e) => (
                    <tr
                      key={`${e.method}-${e.path}`}
                      className="border-b border-border last:border-0 [&>td]:px-4 [&>td]:py-2.5"
                    >
                      <td>
                        <span className={`font-mono text-xs font-semibold ${methodColor[e.method] ?? "text-ink-2"}`}>
                          {e.method}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-ink">{e.path}</td>
                      <td className="text-xs text-muted">{e.auth}</td>
                      <td className="text-xs text-ink-2">{e.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Scopes reference */}
        <div className="rounded-xl border border-border bg-surface-2 p-5">
          <h2 className="mb-3 text-sm font-semibold">Scope Reference</h2>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs">
            {[
              ["products:read",       "Baca produk & redirects"],
              ["products:write",      "Buat / ubah / hapus produk"],
              ["clicks:read",         "Baca & export click events"],
              ["ad_spend:read",       "Baca biaya iklan & komisi"],
              ["ad_spend:write",      "Input biaya iklan & komisi, sync Meta"],
              ["landing_pages:read",  "Baca landing pages"],
              ["landing_pages:write", "Buat / ubah / publish landing pages"],
              ["reports:read",        "Baca laporan agregat"],
              ["settings:read",       "Baca pengaturan & akun Meta"],
              ["settings:write",      "Ubah pengaturan & akun Meta"],
              ["api_keys:manage",     "Kelola API keys (admin only)"],
            ].map(([scope, desc]) => (
              <div key={scope} className="flex gap-2 rounded-md bg-surface px-3 py-1.5">
                <code className="shrink-0 text-brand-300">{scope}</code>
                <span className="text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted pb-4">
          Dashboard Ads · <Link href="/admin" className="hover:underline">Kembali ke dashboard</Link>
        </p>
      </div>
    </div>
  );
}
