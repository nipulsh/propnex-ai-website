import { PageHeader } from "@/components/common/page-header";

export default function SettingsPage() {
  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
      />
    </div>
  );
}
