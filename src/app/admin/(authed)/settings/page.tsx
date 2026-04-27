import { PageShell } from "@/components/page-shell";
import { getSettings } from "@/lib/data/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <PageShell title="Settings" subtitle="Site-wide settings, analytics, and disclosure.">
      <SettingsForm
        initial={{
          site_name: settings?.site_name ?? "",
          site_url: settings?.site_url ?? "",
          default_disclosure_text: settings?.default_disclosure_text ?? "",
          meta_pixel_id: settings?.meta_pixel_id ?? "",
          ga4_measurement_id: settings?.ga4_measurement_id ?? "",
        }}
      />
    </PageShell>
  );
}
