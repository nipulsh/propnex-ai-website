import { PhoneNumberDetailPageContent } from "@/components/phone-numbers/detail/phone-number-detail-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

type PhoneNumberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PhoneNumberDetailPage({
  params,
}: PhoneNumberDetailPageProps) {
  await requirePageAccess("/phone-numbers");
  const { id } = await params;
  return <PhoneNumberDetailPageContent phoneNumberId={id} />;
}
