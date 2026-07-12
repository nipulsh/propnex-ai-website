import { ContactPhonesPageContent } from "@/components/contact-phones/contact-phones-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function PhoneNumbersPage() {
  await requirePageAccess("/phone-numbers");
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ContactPhonesPageContent />
    </div>
  );
}
