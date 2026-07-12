"use client";

import { PlugZap, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSetupStore } from "@/stores/setup-store";

export function SetupPageActions() {
  const isSaving = useSetupStore((state) => state.isSaving);
  const isTesting = useSetupStore((state) => state.isTesting);
  const activeProvider = useSetupStore((state) => state.activeProvider);
  const connectionTested = useSetupStore((state) => state.connectionTested);
  const testConnection = useSetupStore((state) => state.testConnection);
  const saveConfiguration = useSetupStore((state) => state.saveConfiguration);

  const canSave =
    Boolean(activeProvider) &&
    Boolean(activeProvider && connectionTested[activeProvider]);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => void testConnection()}
        disabled={isTesting || !activeProvider}
        className="h-9 gap-2 border-propnex-border bg-propnex-panel px-4"
      >
        <PlugZap className="size-4" />
        {isTesting ? "Testing…" : "Test Connection"}
      </Button>
      <Button
        type="button"
        onClick={() => void saveConfiguration()}
        disabled={isSaving || !canSave}
        className="h-9 gap-2 px-4 shadow-[0_0_16px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]"
      >
        <Save className="size-4" />
        {isSaving ? "Saving…" : "Save Configuration"}
      </Button>
    </div>
  );
}
