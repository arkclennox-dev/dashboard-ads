import { PageShell } from "@/components/page-shell";

const endpoints: Array<{ method: string; path: string; auth: string; desc: string }> = [
  { method: "GET", path: "/api/health", auth: "Public", desc: "Service health check" },
  { method: "GET", path: "/api/products", auth: "API key (products:read)", desc: "List products" },
  { method: "POST", path: "/api/products", auth: "API key (products:write)", desc: "Create product" },
  { method: "GET", path: "/api/products/[id]", auth: "API key (products:read)", desc: "Get product" },
  { method: "PATCH", path: "/api/products/[id]", auth: "API key (products:write)", desc: "Update product" },
  { method: "DELETE", path: "/api/products/[id]", auth: "API key (products:write)", desc: "Soft-delete product" },
  { method: "GET", path: "/api/landing-pages", auth: "API key (landing_pages:read)", desc: "List landing pages" },
  { method: "POST", path: "/api/landing-pages", auth: "API key (landing_pages:write)", desc: "Create landing page" },
  { method: "POST", path: "/api/landing-pages/[id]/publish", auth: "API key (landing_pages:write)", desc: "Publish" },
  { method: "GET", path: "/api/redirects", auth: "API key (products:read)", desc: "List redirects" },
  { method: "GET", path: "/api/redirects/[slug]", auth: "API key (products:read)", desc: "Redirect detail" },
  { method: "GET", path: "/api/clicks", auth: "API key (clicks:read)", desc: "List click events" },
  { method: "GET", path: "/api/clicks/export.csv", auth: "API key (clicks:read)", desc: "CSV export" },
  { method: "GET", path: "/api/ad-spend", auth: "API key (ad_spend:read)", desc: "List ad spend reports" },
  { method: "POST", path: "/api/ad-spend", auth: "API key (ad_spend:write)", desc: "Create ad spend report" },
  { method: "GET", path: "/api/reports/overview", auth: "API key (reports:read)", desc: "Aggregate metrics" },
  { method: "GET", path: "/api/settings", auth: "API key (settings:read)", desc: "Read site settings" },
  { method: "PATCH", path: "/api/settings", auth: "API key (settings:write)", desc: "Update site settings" },
  { method: "GET", path: "/api/public/landing-pages/[slug]", auth: "Public", desc: "Public landing page data" },
];

export default function ApiDocsPage() {
  return (
    <PageShell
      title="API Documentation"
      subtitle="Server-to-server endpoints for AI agents, automation, and CLI tools."
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-xl2 border border-border bg-surface-2 p-4">
          <h2 className="text-sm font-semibold">Authentication</h2>
          <p className="mt-1 text-ink-2">
            Pass your API key in the{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-brand-300">x-api-key</code>{" "}
            header. Keys are created in <code>/admin/api-keys</code>.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface p-3 text-xs text-ink-2">
{`curl https://yourdomain.com/api/products \\
  -H "x-api-key: aff_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"`}
          </pre>
        </div>

        <div className="rounded-xl2 border border-border bg-surface-2">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Endpoints</h2>
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-border [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                <th>Method</th>
                <th>Path</th>
                <th>Auth</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr
                  key={`${e.method}-${e.path}`}
                  className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
                >
                  <td className="font-mono text-xs text-brand-300">{e.method}</td>
                  <td className="font-mono text-xs text-ink">{e.path}</td>
                  <td className="text-muted">{e.auth}</td>
                  <td className="text-ink-2">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
