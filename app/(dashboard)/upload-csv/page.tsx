import { PageHeader } from "@/components/page-header";

export default function UploadCsvPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Upload CSV"
        description="Import contacts or data from a CSV file."
      />
    </div>
  );
}
