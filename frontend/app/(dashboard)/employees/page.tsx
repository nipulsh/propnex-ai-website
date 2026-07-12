import { EmployeesPageContent } from "@/components/employees/employees-page-content";
import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function EmployeesPage() {
  await requirePageAccess("/employees");
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <EmployeesPageContent />
    </div>
  );
}
