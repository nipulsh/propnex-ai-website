"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Bot, BotOff, Archive, X, Sparkles } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { bulkUpdateBranches } from "@/lib/graphql/api";
import { PERMISSIONS } from "@/lib/permissions";
import { useBranchesStore } from "@/stores/branches-store";
import { cn } from "@/lib/utils";

type BulkAction =
  | "ENABLE_AI"
  | "DISABLE_AI"
  | "UPDATE_PROMPT"
  | "CHANGE_STATUS"
  | "ARCHIVE";

type BranchesBulkBarProps = {
  onDone: () => void;
  onNotify: (message: string, type: "success" | "error") => void;
};

export function BranchesBulkBar({
  onDone,
  onNotify,
}: BranchesBulkBarProps) {
  const { hasPermission } = usePermissions();
  const canBulk = hasPermission(PERMISSIONS.BRANCHES_BULK);
  const selectedIds = useBranchesStore((s) => s.selectedIds);
  const clearSelection = useBranchesStore((s) => s.clearSelection);

  const [isBusy, setIsBusy] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [statusValue, setStatusValue] = useState("ACTIVE");

  const count = selectedIds.length;
  if (count === 0 || !canBulk) return null;

  async function runBulk(
    action: BulkAction,
    extra?: { systemPrompt?: string; status?: string },
  ) {
    setIsBusy(true);
    try {
      const result = await bulkUpdateBranches({
        ids: selectedIds,
        action,
        ...extra,
      });
      onNotify(
        `${result.branches.bulkUpdate.updated} branch${
          result.branches.bulkUpdate.updated !== 1 ? "es" : ""
        } updated.`,
        "success",
      );
      clearSelection();
      onDone();
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : "Bulk action failed.",
        "error",
      );
    } finally {
      setIsBusy(false);
      setPromptOpen(false);
      setStatusOpen(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">
          {count} selected
        </span>
        <div className="mx-1 h-5 w-px bg-propnex-border" />
        <Button
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => void runBulk("ENABLE_AI")}
          className="border-propnex-border bg-propnex-bg"
        >
          <Bot className="size-3.5" />
          Enable AI
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => void runBulk("DISABLE_AI")}
          className="border-propnex-border bg-propnex-bg"
        >
          <BotOff className="size-3.5" />
          Disable AI
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => {
            setPromptValue("");
            setPromptOpen(true);
          }}
          className="border-propnex-border bg-propnex-bg"
        >
          <Sparkles className="size-3.5" />
          Update AI Prompt
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => setStatusOpen(true)}
          className="border-propnex-border bg-propnex-bg"
        >
          Change Status
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isBusy}
          onClick={() => void runBulk("ARCHIVE")}
        >
          <Archive className="size-3.5" />
          Archive
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isBusy}
          onClick={() => clearSelection()}
          className="ml-auto text-propnex-muted"
        >
          <X className="size-3.5" />
          Clear
        </Button>
      </div>

      <BulkPromptDialog
        open={promptOpen}
        onOpenChange={setPromptOpen}
        value={promptValue}
        onChange={setPromptValue}
        count={count}
        isBusy={isBusy}
        onConfirm={() =>
          void runBulk("UPDATE_PROMPT", { systemPrompt: promptValue })
        }
      />

      <BulkStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        value={statusValue}
        onChange={setStatusValue}
        count={count}
        isBusy={isBusy}
        onConfirm={() => void runBulk("CHANGE_STATUS", { status: statusValue })}
      />
    </>
  );
}

const POPUP_CLASS = cn(
  "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
  "rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg",
  "transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
);

function BulkPromptDialog({
  open,
  onOpenChange,
  value,
  onChange,
  count,
  isBusy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  count: number;
  isBusy: boolean;
  onConfirm: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup className={POPUP_CLASS}>
          <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
            Update AI Prompt
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
            This system prompt will replace the prompt for {count} selected
            branch{count !== 1 ? "es" : ""}.
          </DialogPrimitive.Description>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            placeholder="Enter the system prompt to apply…"
            className="mt-4 w-full resize-y rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-propnex-muted focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
          />
          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 flex-1 border-propnex-border bg-propnex-bg"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isBusy || value.trim().length === 0}
              className="h-10 flex-1"
            >
              {isBusy ? "Applying…" : "Apply Prompt"}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function BulkStatusDialog({
  open,
  onOpenChange,
  value,
  onChange,
  count,
  isBusy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  count: number;
  isBusy: boolean;
  onConfirm: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup className={POPUP_CLASS}>
          <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
            Change Status
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
            Set a new status for {count} selected branch{count !== 1 ? "es" : ""}.
          </DialogPrimitive.Description>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-4 h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 flex-1 border-propnex-border bg-propnex-bg"
            >
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={isBusy} className="h-10 flex-1">
              {isBusy ? "Applying…" : "Apply"}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
