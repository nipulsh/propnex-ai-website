import { Suspense } from "react";

import { CallLogsPageContent } from "@/components/call-logs/call-logs-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function CallLogsPage() {
  await requirePageAccess("/call-logs");
  return (
    <Suspense fallback={null}>
      <CallLogsPageContent />
    </Suspense>
  );
}
