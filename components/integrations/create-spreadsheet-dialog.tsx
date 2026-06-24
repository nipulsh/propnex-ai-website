"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ColumnMapping } from "@/lib/integrations/types";
import { PROPNEX_FIELD_PRESETS } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

type CreateSpreadsheetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, columns: ColumnMapping[]) => Promise<void>;
  isCreating?: boolean;
};

export function CreateSpreadsheetDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating = false,
}: CreateSpreadsheetDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedFields, setSelectedFields] = useState<ColumnMapping[]>([]);
  const [name, setName] = useState("");

  function toggleField(id: string, label: string) {
    setSelectedFields((current) => {
      const exists = current.some((field) => field.propnexField === id);
      if (exists) {
        return current.filter((field) => field.propnexField !== id);
      }
      return [
        ...current,
        { propnexField: id, label, spreadsheetColumn: "" },
      ];
    });
  }

  function handleClose() {
    setStep(1);
    setSelectedFields([]);
    setName("");
    onOpenChange(false);
  }

  async function handleCreate() {
    const sheetName = name.trim() || `PropNex Sheet ${new Date().toLocaleDateString()}`;
    await onCreate(sheetName, selectedFields);
    handleClose();
  }

  if (!open) return null;

  return (
    <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Create spreadsheet — Step {step} of 2
        </h4>
        <button
          type="button"
          onClick={handleClose}
          className="text-xs text-propnex-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-xs text-propnex-muted">
            Select the columns to include in your new spreadsheet. A header row
            will be created from these fields.
          </p>
          <div className="flex flex-wrap gap-2">
            {PROPNEX_FIELD_PRESETS.map((preset) => {
              const selected = selectedFields.some(
                (field) => field.propnexField === preset.id,
              );
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => toggleField(preset.id, preset.label)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-propnex-accent bg-propnex-accent/10 text-propnex-accent"
                      : "border-propnex-border bg-propnex-panel text-foreground hover:border-propnex-accent/50",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          {selectedFields.length === 0 ? (
            <p className="text-xs text-destructive">
              Select at least one column to continue.
            </p>
          ) : null}
          <Button
            size="sm"
            disabled={selectedFields.length === 0}
            onClick={() => setStep(2)}
          >
            Next: Name spreadsheet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-propnex-muted">
            {selectedFields.length} column(s) selected:{" "}
            {selectedFields.map((field) => field.label).join(", ")}
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Spreadsheet name"
            className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-panel px-3 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create spreadsheet"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
