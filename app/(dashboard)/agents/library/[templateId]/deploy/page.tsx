import { DeployAgentPageContent } from "@/components/agents/library/deploy-agent-page-content";

type DeployAgentPageProps = {
  params: Promise<{ templateId: string }>;
};

export default async function DeployAgentPage({ params }: DeployAgentPageProps) {
  const { templateId } = await params;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DeployAgentPageContent templateId={templateId} />
    </div>
  );
}
