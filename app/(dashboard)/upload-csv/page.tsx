import { PageHeader } from "@/components/common/page-header";

export default function UploadCsvPage() {
  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6">
      <PageHeader
        title="Upload CSV"
        description="Import contacts or data from a CSV file."
      />
    </div>
  );
}
