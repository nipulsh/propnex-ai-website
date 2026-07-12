import { HowItWorksPageContent } from "@/components/how-it-works/how-it-works-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function HowItWorksPage() {
  await requirePageAccess("/how-it-works");
  return <HowItWorksPageContent />;
}
