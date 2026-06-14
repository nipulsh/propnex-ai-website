import { PageHeader } from "@/components/common/page-header";

export default function PhoneNumbersPage() {
  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6">
      <PageHeader
        title="Phone Numbers"
        description="Manage phone numbers assigned to your agents."
      />
    </div>
  );
}
