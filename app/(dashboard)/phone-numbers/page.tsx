import { PageHeader } from "@/components/page-header";

export default function PhoneNumbersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Phone Numbers"
        description="Manage phone numbers assigned to your agents."
      />
    </div>
  );
}
