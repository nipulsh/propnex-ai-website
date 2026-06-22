"use client";

import Link from "next/link";
import { Clock, Crown, Eye, Rocket } from "lucide-react";

import { HearAgentButton } from "@/components/agents/hear-agent-button";
import { Button } from "@/components/ui/button";
import type { AgentLibraryTemplate } from "@/lib/agent-library-data";
import { cn } from "@/lib/utils";

const DEPLOY_UI_ENABLED = false;

type LibraryTemplateCardProps = {
  template: AgentLibraryTemplate;
  onPreview: (template: AgentLibraryTemplate) => void;
};

export function LibraryTemplateCard({
  template,
  onPreview,
}: LibraryTemplateCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-propnex-border bg-propnex-panel p-5">
      <div className="flex-1 space-y-3">
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
              template.category === "Premium"
                ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-600/15 text-amber-200"
                : "border-propnex-border bg-propnex-bg text-propnex-muted",
            )}
          >
            {template.category === "Premium" ? (
              <Crown className="size-3 text-amber-400" />
            ) : null}
            {template.category}
          </span>
          <h3 className="mt-2 text-base font-semibold text-foreground">
            {template.name}
          </h3>
        </div>

        <p className="line-clamp-2 text-sm text-propnex-muted">
          {template.profile}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {template.useCases.slice(0, 3).map((uc) => (
            <span
              key={uc}
              className="rounded-md bg-propnex-bg px-2 py-0.5 text-[10px] text-propnex-muted"
            >
              {uc}
            </span>
          ))}
          {template.useCases.length > 3 ? (
            <span className="text-[10px] text-propnex-muted">
              +{template.useCases.length - 3} more
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-propnex-muted">
            <Clock className="size-3.5 text-propnex-accent" />
            ~{template.estimatedSetupMinutes} min setup
          </div>
          <HearAgentButton
            agent={{
              id: template.id,
              name: template.name,
              demoAudioUrl: template.demoAudioUrl,
              firstMessage: template.defaultFirstMessage,
            } as never}
            className="h-8 px-2.5"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-propnex-border pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPreview(template)}
          className="flex-1 gap-1.5 border-propnex-border bg-propnex-bg text-xs"
        >
          <Eye className="size-3.5" />
          Preview
        </Button>
        {DEPLOY_UI_ENABLED ? (
          <Button
            nativeButton={false}
            render={
              <Link href={`/agents/library/${template.id}/deploy`} />
            }
            size="sm"
            className="flex-1 gap-1.5 text-xs"
          >
            <Rocket className="size-3.5" />
            Deploy
          </Button>
        ) : null}
      </div>
    </article>
  );
}
