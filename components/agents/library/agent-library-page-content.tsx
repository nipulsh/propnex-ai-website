"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Search } from "lucide-react";

import { LibraryTemplateCard } from "@/components/agents/library/library-template-card";
import { TemplatePreviewDialog } from "@/components/agents/library/template-preview-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Input } from "@/components/ui/input";
import {
  filterLibraryTemplates,
  LIBRARY_CATEGORY_OPTIONS,
  type AgentLibraryTemplate,
} from "@/lib/agent-library-data";
import { useAgentLibraryGraphQL } from "@/hooks/use-agent-library-graphql";
import { cn } from "@/lib/utils";

export function AgentLibraryPageContent() {
  const router = useRouter();
  const { templates, error } = useAgentLibraryGraphQL();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewTemplate, setPreviewTemplate] =
    useState<AgentLibraryTemplate | null>(null);

  const filtered = useMemo(
    () => filterLibraryTemplates(templates, searchQuery, categoryFilter),
    [templates, searchQuery, categoryFilter],
  );

  function handleDeployFromPreview(templateId: string) {
    setPreviewTemplate(null);
    router.push(`/agents/library/${templateId}/deploy`);
  }

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <PageHeader
        title="Voice Agent Library"
        description="Ready-to-use PropNex AI voice agents with demo audio — preview and hear each agent."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voice agents..."
            className="h-11 border-propnex-border bg-propnex-panel pl-10"
          />
        </div>
        <div className="propnex-scrollbar flex gap-2 overflow-x-auto pb-1">
          {LIBRARY_CATEGORY_OPTIONS.map((opt) => {
            const isPremium = opt.value === "Premium";
            const isSelected = categoryFilter === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategoryFilter(opt.value)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                  isPremium
                    ? isSelected
                      ? "border-amber-400/70 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-600/25 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.2)]"
                      : "border-amber-500/35 bg-propnex-panel text-amber-300/90 hover:border-amber-400/55 hover:bg-amber-500/10 hover:text-amber-200"
                    : isSelected
                      ? "border-propnex-accent/50 bg-propnex-accent/15 text-propnex-accent"
                      : "border-propnex-border bg-propnex-panel text-propnex-muted hover:text-foreground",
                )}
              >
                {isPremium ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Crown className="size-3.5 text-amber-400" />
                    {opt.label}
                  </span>
                ) : (
                  opt.label
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-propnex-border bg-propnex-panel/50 px-6 py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-propnex-border bg-propnex-panel/50 px-6 py-16 text-center">
          <p className="text-sm text-propnex-muted">
            No voice agents match your search.
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
