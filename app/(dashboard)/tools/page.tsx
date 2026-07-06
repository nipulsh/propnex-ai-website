import { ToolsPageContent } from "@/components/tools/tools-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function ToolsPage() {
  await requirePageAccess("/tools");
  return <ToolsPageContent />;
}
