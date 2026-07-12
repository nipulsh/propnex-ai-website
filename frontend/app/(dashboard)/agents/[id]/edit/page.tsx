import { CreateAgentPageContent } from "@/components/agents/create/create-agent-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

type AgentEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentEditPage({ params }: AgentEditPageProps) {
  const { id } = await params;
  await requirePageAccess(`/agents/${id}/edit`);
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CreateAgentPageContent editId={id} />
    </div>
  );
}
