"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { BillingToolConfigForm } from "@/components/agent-tools/billing-tool-config";
import { FaqToolConfigForm } from "@/components/agent-tools/faq-tool-config";
import { GoogleCalendarToolConfigForm } from "@/components/agent-tools/google-calendar-tool-config";
import { GoogleSheetsToolConfigForm } from "@/components/agent-tools/google-sheets-tool-config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Agent } from "@/lib/agents-data";
import { getToolDefinition } from "@/lib/tools/registry";
import type {
  AgentToolAssignment,
  BillingToolConfig,
  FaqToolConfig,
  GoogleCalendarToolConfig,
  GoogleSheetsToolConfig,
} from "@/lib/tools/types";

type AgentToolConfigSheetProps = {
  agent: Agent;
  tool: AgentToolAssignment | null;
  open: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (update: Partial<AgentToolAssignment>) => void;
};

export function AgentToolConfigSheet({
  agent,
  tool,
  open,
  isSaving,
  onOpenChange,
  onSave,
}: AgentToolConfigSheetProps) {
  const [draftConfig, setDraftConfig] = useState(tool?.config);

  useEffect(() => {
    if (tool) setDraftConfig(tool.config);
  }, [tool]);

  if (!tool) return null;

  const definition = getToolDefinition(tool.toolId);

  function handleOpenChange(next: boolean) {
    if (next && tool) {
      setDraftConfig(tool.config);
    }
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="propnex-scrollbar w-full overflow-y-auto border-propnex-border bg-propnex-panel sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>{definition?.name ?? tool.toolId}</SheetTitle>
          <SheetDescription>
            {definition?.description ?? "Configure tool settings and permissions."}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          {tool.toolId === "faq" && draftConfig ? (
            <FaqToolConfigForm
              config={draftConfig as FaqToolConfig}
              knowledgeSources={agent.knowledgeSources}
              onChange={setDraftConfig}
            />
          ) : null}
          {tool.toolId === "billing" && draftConfig ? (
            <BillingToolConfigForm
              config={draftConfig as BillingToolConfig}
              onChange={setDraftConfig}
            />
          ) : null}
          {tool.toolId === "google-calendar" && draftConfig ? (
            <GoogleCalendarToolConfigForm
              config={draftConfig as GoogleCalendarToolConfig}
              onChange={setDraftConfig}
            />
          ) : null}
          {tool.toolId === "google-sheets" && draftConfig ? (
            <GoogleSheetsToolConfigForm
              config={draftConfig as GoogleSheetsToolConfig}
              onChange={setDraftConfig}
            />
          ) : null}
        </div>

        <SheetFooter>
          <Button
            onClick={() => onSave({ config: draftConfig })}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save configuration"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
