"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GoogleCalendarDetailPanel } from "@/components/integrations/google-calendar-detail-panel";
import { GoogleSheetsDetailPanel } from "@/components/integrations/google-sheets-detail-panel";
import { IntegrationStatusBadge } from "@/components/integrations/integration-status-badge";
import type { WorkspaceIntegration } from "@/lib/integrations/types";

type IntegrationDetailSheetProps = {
  integration: WorkspaceIntegration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function IntegrationDetailSheet({
  integration,
  open,
  onOpenChange,
}: IntegrationDetailSheetProps) {
  if (!integration) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="propnex-scrollbar w-full overflow-y-auto border-propnex-border bg-propnex-panel sm:max-w-lg"
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{integration.name}</SheetTitle>
            <IntegrationStatusBadge status={integration.status} />
          </div>
          <SheetDescription>
            Configure your {integration.name} connection and sync settings.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6">
          {integration.id === "google-sheets" ? (
            <GoogleSheetsDetailPanel integration={integration} />
          ) : null}
          {integration.id === "google-calendar" ? (
            <GoogleCalendarDetailPanel integration={integration} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
