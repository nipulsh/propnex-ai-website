"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type IntelligenceDialogMode =
  | "structured-output"
  | "scorecard"
  | "monitor";

type IntelligenceItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: IntelligenceDialogMode;
  initialValues?: Record<string, string>;
  onSave: (values: Record<string, string>) => void;
};

const MODE_CONFIG: Record<
  IntelligenceDialogMode,
  { title: string; fields: { key: string; label: string; placeholder: string }[] }
> = {
  "structured-output": {
    title: "Structured Output Field",
    fields: [
      { key: "name", label: "Field Name", placeholder: "Customer Name" },
      {
        key: "description",
        label: "Description",
        placeholder: "Full name of the caller",
      },
      { key: "type", label: "Type", placeholder: "text | number | boolean | enum" },
    ],
  },
  scorecard: {
    title: "Scorecard",
    fields: [
      { key: "name", label: "Name", placeholder: "Greeting Quality" },
      {
        key: "criteria",
        label: "Criteria",
        placeholder: "Professional opening within 3 seconds",
      },
      { key: "weight", label: "Weight (%)", placeholder: "25" },
    ],
  },
  monitor: {
    title: "Monitor",
    fields: [
      { key: "name", label: "Name", placeholder: "Compliance Monitoring" },
      {
        key: "type",
        label: "Type",
        placeholder: "compliance | quality | lead-qualification",
      },
    ],
  },
};

export function IntelligenceItemDialog({
  open,
  onOpenChange,
  mode,
  initialValues = {},
  onSave,
}: IntelligenceItemDialogProps) {
  const config = MODE_CONFIG[mode];
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const defaults: Record<string, string> = {};
      for (const field of config.fields) {
        defaults[field.key] = initialValues[field.key] ?? "";
      }
      setValues(defaults);
    }
  }, [open, initialValues, config.fields]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave(values);
    onOpenChange(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {initialValues.name ? `Edit ${config.title}` : `Add ${config.title}`}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="rounded-lg p-1 text-propnex-muted hover:bg-propnex-bg hover:text-foreground"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {config.fields.map((field) => (
              <div key={field.key}>
                <label className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  {field.label}
                </label>
                <Input
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="mt-1.5 h-11 border-propnex-border bg-propnex-bg"
                  required
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 flex-1 border-propnex-border bg-propnex-bg"
              >
                Cancel
              </Button>
              <Button type="submit" className="h-11 flex-1">
                Save
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
