import { Suspense } from "react";

import { ContactPageContent } from "@/components/contact/contact-page-content";
import { BranchContactPageContent } from "@/components/contact/branch-contact-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function ContactPage() {
  const ctx = await requirePageAccess("/contact");
  const isBranchAdmin = ctx && ctx.role === "ADMIN" && ctx.branchAccess.type === "SELECTED";

  return (
    <Suspense fallback={null}>
      {isBranchAdmin ? <BranchContactPageContent /> : <ContactPageContent />}
    </Suspense>
  );
}
