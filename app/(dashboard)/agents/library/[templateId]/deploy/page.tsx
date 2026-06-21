import { redirect } from "next/navigation";

// DeployAgentPageContent kept at components/agents/library/deploy-agent-page-content.tsx
export default async function DeployAgentPage() {
  redirect("/agents/library");
}
