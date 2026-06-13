import { PageHeader } from "@/components/page-header";

export default function ReviewsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Reviews"
        description="Browse customer reviews and feedback from calls."
      />
    </div>
  );
}
