import { Suspense } from "react";

import { SettingsPageContent } from "@/components/settings/settings-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function SettingsPage() {
  await requirePageAccess("/settings");
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  );
}
