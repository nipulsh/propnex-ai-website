import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
      />
    </div>
  );
}
