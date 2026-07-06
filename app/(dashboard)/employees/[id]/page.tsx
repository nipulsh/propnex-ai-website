import { EmployeeDetailPageContent } from "@/components/employees/employee-detail-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: Props) {
  await requirePageAccess("/employees");
  const { id } = await params;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <EmployeeDetailPageContent employeeId={id} />
    </div>
  );
}
