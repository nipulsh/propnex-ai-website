import { AgentsPageContent } from "@/components/agents/agents-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function AgentsPage() {
  await requirePageAccess("/agents");
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AgentsPageContent />
    </div>
  );
}
