import { Suspense } from "react";

import { ContactPageContent } from "@/components/contact/contact-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function ContactPage() {
  await requirePageAccess("/contact");
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}
