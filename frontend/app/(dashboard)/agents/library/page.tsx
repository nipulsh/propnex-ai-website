import { AgentLibraryPageContent } from "@/components/agents/library/agent-library-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function AgentLibraryPage() {
  await requirePageAccess("/agents/library");
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AgentLibraryPageContent />
    </div>
  );
}
