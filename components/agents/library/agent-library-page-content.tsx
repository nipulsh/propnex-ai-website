"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";

import { LibraryTemplateCard } from "@/components/agents/library/library-template-card";
import { TemplatePreviewDialog } from "@/components/agents/library/template-preview-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  agentLibraryTemplates,
  filterLibraryTemplates,
  LIBRARY_CATEGORY_OPTIONS,
  type AgentLibraryTemplate,
} from "@/lib/agent-library-data";
import { cn } from "@/lib/utils";

export function AgentLibraryPageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewTemplate, setPreviewTemplate] =
    useState<AgentLibraryTemplate | null>(null);

  const filtered = useMemo(
    () =>
      filterLibraryTemplates(
        agentLibraryTemplates,
        searchQuery,
        categoryFilter,
      ),
    [searchQuery, categoryFilter],
  );

  function handleDeployFromPreview(templateId: string) {
    setPreviewTemplate(null);
    router.push(`/agents/library/${templateId}/deploy`);
  }

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/agents" />}
        className="w-fit gap-2 px-0 text-propnex-muted hover:bg-transparent hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Agents
      </Button>

      <PageHeader
        title="Agent Library"
        description="Ready-to-use PropNex AI templates designed for rapid deployment."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="h-11 border-propnex-border bg-propnex-panel pl-10"
          />
        </div>
        <div className="propnex-scrollbar flex gap-2 overflow-x-auto pb-1">
          {LIBRARY_CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategoryFilter(opt.value)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                categoryFilter === opt.value
                  ? "border-propnex-accent/50 bg-propnex-accent/15 text-propnex-accent"
                  : "border-propnex-border bg-propnex-panel text-propnex-muted hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-propnex-border bg-propnex-panel/50 px-6 py-16 text-center">
          <p className="text-sm text-propnex-muted">
            No templates match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <LibraryTemplateCard
              key={template.id}
              template={template}
              onPreview={setPreviewTemplate}
            />
          ))}
        </div>
      )}

      <TemplatePreviewDialog
        template={previewTemplate}
        open={previewTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
        onDeploy={handleDeployFromPreview}
      />
    </div>
  );
}
