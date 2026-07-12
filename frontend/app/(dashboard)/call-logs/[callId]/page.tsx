import { CallDetailPageContent } from "@/components/call-details/call-detail-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

type CallDetailPageProps = {
  params: Promise<{ callId: string }>;
};

export default async function CallDetailPage({ params }: CallDetailPageProps) {
  await requirePageAccess("/call-logs");
  const { callId } = await params;
  return <CallDetailPageContent callId={callId} />;
}
