import { PageHeader } from "@/components/common/page-header";

export default function HowItWorksPage() {
  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6">
      <PageHeader
        title="How It Works"
        description="Learn how to set up and use PropNex voice agents."
      />
    </div>
  );
}
