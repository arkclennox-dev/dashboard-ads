import { PageShell } from "@/components/page-shell";
import { getSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <PageShell title="Settings" subtitle="Site-wide settings, analytics, and disclosure.">
      <form className="grid max-w-2xl grid-cols-1 gap-4">
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Site name</div>
          <input
            className={inputCls}
            defaultValue={settings?.site_name ?? ""}
            disabled
          />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Site URL</div>
          <input
            className={inputCls}
            defaultValue={settings?.site_url ?? ""}
            disabled
          />
        </label>
        <label className="block">
          <div className="mb-1.5 text-xs font-medium text-ink-2">Disclosure text</div>
          <textarea
            className={inputCls}
            rows={4}
            defaultValue={settings?.default_disclosure_text ?? ""}
            disabled
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-ink-2">Meta Pixel ID</div>
            <input className={inputCls} defaultValue={settings?.meta_pixel_id ?? ""} disabled />
          </label>
          <label className="block">
            <div className="mb-1.5 text-xs font-medium text-ink-2">GA4 Measurement ID</div>
            <input
              className={inputCls}
              defaultValue={settings?.ga4_measurement_id ?? ""}
              disabled
            />
          </label>
        </div>
        <p className="text-xs text-muted-2">
          Use <code className="text-brand-300">PATCH /api/settings</code> to update these
          values when Supabase is configured.
        </p>
      </form>
    </PageShell>
  );
}
