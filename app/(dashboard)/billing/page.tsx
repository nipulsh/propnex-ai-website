import { BillingPageContent } from "@/components/billing/billing-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function BillingPage() {
  await requirePageAccess("/billing");
  return <BillingPageContent />;
}
