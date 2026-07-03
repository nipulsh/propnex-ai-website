import { BranchDetailPageContent } from "@/components/branches/detail/branch-detail-page-content";

type BranchDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BranchDetailPage({
  params,
}: BranchDetailPageProps) {
  const { id } = await params;
  return <BranchDetailPageContent branchId={id} />;
}
