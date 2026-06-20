"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Clock, XIcon } from "lucide-react";

import { HearAgentButton } from "@/components/agents/hear-agent-button";
import { Button } from "@/components/ui/button";
import type { AgentLibraryTemplate } from "@/lib/agent-library-data";

type TemplatePreviewDialogProps = {
  template: AgentLibraryTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeploy: (templateId: string) => void;
};

export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  onDeploy,
}: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                {template.name}
              </DialogPrimitive.Title>
              <p className="mt-1 text-sm text-propnex-muted">
                {template.category}
              </p>
            </div>
            <DialogPrimitive.Close
              className="rounded-lg p-1 text-propnex-muted hover:bg-propnex-bg"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground/90">
            {template.profile}
          </p>

          <div className="mt-4">
            <HearAgentButton
              agent={{
                id: template.id,
                name: template.name,
                demoAudioUrl: template.demoAudioUrl,
                firstMessage: template.defaultFirstMessage,
              } as never}
            />
          </div>

          <div className="mt-4">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Supported Use Cases
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-propnex-muted">
              {template.useCases.map((uc) => (
                <li key={uc}>{uc}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-propnex-muted">
            <Clock className="size-4 text-propnex-accent" />
            ~{template.estimatedSetupMinutes} min setup
          </div>

          <div className="mt-4 rounded-lg border border-propnex-border bg-propnex-bg p-4">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Sample Prompt
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/80">
              {template.samplePrompt}
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 flex-1 border-propnex-border bg-propnex-bg"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => onDeploy(template.id)}
              className="h-11 flex-1"
            >
              Deploy Template
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
