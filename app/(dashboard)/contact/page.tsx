import { Suspense } from "react";

import { ContactPageContent } from "@/components/contact/contact-page-content";

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}
