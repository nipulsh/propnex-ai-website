import { CallDetailPageContent } from "@/components/call-details/call-detail-page-content";

type CallDetailPageProps = {
  params: Promise<{ callId: string }>;
};

export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const { callId } = await params;
  return <CallDetailPageContent callId={callId} />;
}
