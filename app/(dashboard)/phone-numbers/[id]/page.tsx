import { PhoneNumberDetailPageContent } from "@/components/phone-numbers/detail/phone-number-detail-page-content";

type PhoneNumberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PhoneNumberDetailPage({
  params,
}: PhoneNumberDetailPageProps) {
  const { id } = await params;
  return <PhoneNumberDetailPageContent phoneNumberId={id} />;
}
