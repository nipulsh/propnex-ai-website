import { BranchDetailPageContent } from "@/components/branches/detail/branch-detail-page-content";

type BranchDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BranchDetailPage({
  params,
}: BranchDetailPageProps) {
  const { id } = await params;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BranchDetailPageContent branchId={id} />
    </div>
  );
}
