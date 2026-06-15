import { Suspense } from "react";

import { CallLogsPageContent } from "@/components/call-logs/call-logs-page-content";

export default function CallLogsPage() {
  return (
    <Suspense fallback={null}>
      <CallLogsPageContent />
    </Suspense>
  );
}
