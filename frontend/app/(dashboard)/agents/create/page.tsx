import { redirect } from "next/navigation";

import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function CreateAgentPage() {
  await requirePageAccess("/agents/create");
  redirect("/agents/library");
}
