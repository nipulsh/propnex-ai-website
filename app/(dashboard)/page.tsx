import { PageHeader } from "@/components/page-header";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Home"
        description="Overview of your PropNex workspace."
      />
    </div>
  );
}
