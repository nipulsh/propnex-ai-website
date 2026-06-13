import { PageHeader } from "@/components/page-header";

export default function CallLogsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Call Logs"
        description="View and search your call history."
      />
    </div>
  );
}
