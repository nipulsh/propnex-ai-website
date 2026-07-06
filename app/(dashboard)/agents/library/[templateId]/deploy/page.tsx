import { redirect } from "next/navigation";

import { requirePageAccess } from "@/lib/auth/require-page-permission";

type DeployAgentPageProps = {
  params: Promise<{ templateId: string }>;
};

export default async function DeployAgentPage({ params }: DeployAgentPageProps) {
  const { templateId } = await params;
  await requirePageAccess(`/agents/library/${templateId}/deploy`);
  redirect("/agents/library");
}
