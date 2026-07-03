import { EmployeeDetailPageContent } from "@/components/employees/employee-detail-page-content";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <EmployeeDetailPageContent employeeId={id} />
    </div>
  );
}
