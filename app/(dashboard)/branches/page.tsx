import { BranchesPageContent } from "@/components/branches/branches-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function BranchesPage() {
  await requirePageAccess("/branches");
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BranchesPageContent />
    </div>
  );
}
