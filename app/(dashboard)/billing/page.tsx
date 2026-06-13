import { PageHeader } from "@/components/page-header";

export default function BillingPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Billing"
        description="View your plan, usage, and payment details."
      />
    </div>
  );
}
