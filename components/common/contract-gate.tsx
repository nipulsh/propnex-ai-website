"use client";

import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useContractStatus } from "@/components/common/contract-status-provider";
import { useSideNotification } from "@/components/common/side-notification";

const SETTINGS_PATH = "/settings?tab=workspace";

/**
 * Gates dashboard content behind a linked Contract ID. While unlinked, the
 * real page (and its data-fetching hooks) is never mounted -- a generic
 * blurred placeholder is shown instead so no tenant data is requested.
 */
export function ContractGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { notify } = useSideNotification();
  const { status, isLoading } = useContractStatus();

  if (isLoading || status === null) {
    return (
      <div className="flex h-full min-h-[320px] flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-propnex-muted" />
      </div>
    );
  }

  if (status.linked) {
    return <>{children}</>;
  }

  function handleUnlockClick() {
    notify({
      type: "info",
      message:
        "Authorized access required. Add your Contract ID under Settings → Workspace (/settings) to unlock this page.",
      duration: 6000,
    });
    router.push(SETTINGS_PATH);
  }

  return (
    <div className="relative flex h-full min-h-[400px] flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none flex-1 select-none overflow-hidden blur-md opacity-50"
      >
        <GatePlaceholder />
      </div>
      <button
        type="button"
        onClick={handleUnlockClick}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/40 px-6 text-center backdrop-blur-[2px] transition-colors hover:bg-background/50"
      >
        <span className="flex size-12 items-center justify-center rounded-full border border-propnex-border bg-propnex-panel">
          <Lock className="size-5 text-propnex-muted" />
        </span>
        <span className="text-sm font-medium text-foreground">
          Authorized Access Required
        </span>
        <span className="max-w-xs text-xs text-propnex-muted">
          Link your Contract ID to unlock this page. Click here to add it in
          Settings.
        </span>
      </button>
    </div>
  );
}

function GatePlaceholder() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-48 rounded-md bg-propnex-border/60" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-lg bg-propnex-border/40" />
        <div className="h-24 rounded-lg bg-propnex-border/40" />
        <div className="h-24 rounded-lg bg-propnex-border/40" />
      </div>
      <div className="h-64 rounded-lg bg-propnex-border/40" />
    </div>
  );
}
