import { TemplateConfigurePageContent } from "@/components/agents/library/template-configure-page-content";

type TemplateConfigurePageProps = {
  params: Promise<{ templateId: string }>;
};

export default async function TemplateConfigurePage({
  params,
}: TemplateConfigurePageProps) {
  const { templateId } = await params;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TemplateConfigurePageContent templateId={templateId} />
    </div>
  );
}
