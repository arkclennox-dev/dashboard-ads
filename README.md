# Affiliate Click Dashboard

A lightweight Next.js + Supabase dashboard for managing affiliate redirect URLs,
landing pages, and Meta Ads click performance.

## Features

- **Overview dashboard** with ad-set performance, sparkline metrics, and Clicks/Spend charts.
- **Redirect Link Builder** in the Overview right panel and on `/admin/redirects`.
- **`/go/[slug]`** redirect route with UTM parsing, IP hashing, basic bot/duplicate detection, and 302 redirects.
- **`/rekomendasi/[slug]`** public landing pages that preserve UTM params on CTA buttons.
- **API layer** under `/api/*` validated with Zod, supporting either an admin Supabase session OR a scoped API key in the `x-api-key` header.
- **Demo mode**: when Supabase env vars are missing, the app runs against an in-memory seeded store so the UI is browseable without external services. Write APIs return `503 DEMO_READ_ONLY`.

## Stack

- Next.js 14 App Router, TypeScript (strict)
- Tailwind CSS (custom dark theme)
- Supabase Postgres + Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- Zod for input validation

## Local development

```bash
npm install
cp .env.local.example .env.local   # leave Supabase blank to run in demo mode
npm run dev
```

The app boots at <http://localhost:3000>. The admin dashboard is at `/admin`.

## Database setup (Supabase)

1. Create a Supabase project.
2. Apply the migration in `supabase/migrations/0001_init.sql` via the Supabase SQL editor or `supabase db push`.
3. Fill in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   API_KEY_SECRET=<long-random-string>
   ```
4. Restart `npm run dev`.

## Routes

### Public

| Path | Description |
| --- | --- |
| `/` | Marketing splash with a link into the dashboard |
| `/rekomendasi/[slug]` | Landing page renderer |
| `/go/[slug]` | 302 redirect with click logging |
| `/privacy-policy` | Static disclosure |
| `/disclaimer` | Static disclosure |

### Admin

| Path | Description |
| --- | --- |
| `/admin` | Overview matching the design |
| `/admin/login` | Supabase auth form (email/password) |
| `/admin/products` | Affiliate products list |
| `/admin/products/new` | Create product form |
| `/admin/landing-pages` | Landing pages list |
| `/admin/redirects` | Redirect builder + URL table |
| `/admin/clicks` | Click events |
| `/admin/ad-spend` | Manual Meta Ads spend reports |
| `/admin/reports` | Aggregate KPIs |
| `/admin/api-keys` | Integrations / API key management |
| `/admin/api-docs` | Public API reference |
| `/admin/settings` | Site settings |
| `/admin/billing` | Plan / billing |
| `/admin/notifications` | Recent alerts |

### API

See `/admin/api-docs` for the full list. Highlights:

- `GET /api/health`
- `GET|POST /api/products`, `GET|PATCH|DELETE /api/products/[id]`
- `GET|POST /api/landing-pages`, `POST /api/landing-pages/[id]/publish|unpublish`
- `GET /api/redirects`, `GET /api/redirects/[slug]`
- `GET /api/clicks`, `GET /api/clicks/export.csv`
- `GET|POST /api/ad-spend`
- `GET /api/reports/overview`
- `GET|PATCH /api/settings`
- `GET /api/public/landing-pages/[slug]`

API keys must be sent in `x-api-key`. Required scopes are documented per endpoint.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint via `next lint` |
| `npm run typecheck` | `tsc --noEmit` |

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add the four `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `API_KEY_SECRET` env vars.
4. Deploy. With env vars missing, the preview URL still renders in demo mode.
