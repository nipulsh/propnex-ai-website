import { LeadReactivationPageContent } from "@/components/lead-reactivation/lead-reactivation-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function LeadReactivationPage() {
  await requirePageAccess("/lead-reactivation");
  return <LeadReactivationPageContent />;
}
