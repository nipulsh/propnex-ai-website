import { redirect } from "next/navigation";

// CreateAgentPageContent kept at components/agents/create/create-agent-page-content.tsx
export default function CreateAgentPage() {
  redirect("/agents/library");
}
