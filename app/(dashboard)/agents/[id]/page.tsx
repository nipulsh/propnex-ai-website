import { AgentDetailPageContent } from "@/components/agents/detail/agent-detail-page-content";

type AgentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AgentDetailPageContent agentId={id} />
    </div>
  );
}
