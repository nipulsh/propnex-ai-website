import { SetupPageContent } from "@/components/setup/setup-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function SetupPage() {
  await requirePageAccess("/setup");
  return <SetupPageContent />;
}
