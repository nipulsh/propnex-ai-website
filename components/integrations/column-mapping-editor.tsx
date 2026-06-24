"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ColumnMapping } from "@/lib/integrations/types";
import { PROPNEX_FIELD_PRESETS, SHEET_COLUMN_PRESETS } from "@/lib/integrations/types";

type ColumnMappingEditorProps = {
  mappings: ColumnMapping[];
  onChange: (mappings: ColumnMapping[]) => void;
  columnOptions?: string[];
};

export function ColumnMappingEditor({
  mappings,
  onChange,
  columnOptions,
}: ColumnMappingEditorProps) {
  const [customField, setCustomField] = useState("");

  const availableColumns =
    columnOptions && columnOptions.length > 0
      ? columnOptions.map((header, index) => ({
          value: header,
          label: header || `Column ${String.fromCharCode(65 + index)}`,
        }))
      : SHEET_COLUMN_PRESETS.map((col) => ({ value: col, label: col }));

  function addMapping(propnexField: string, label: string) {
    const unusedColumn = availableColumns.find(
      (col) => !mappings.some((m) => m.spreadsheetColumn === col.value),
    );
    if (!unusedColumn) return;
    onChange([
      ...mappings,
      { propnexField, spreadsheetColumn: unusedColumn.value, label },
    ]);
  }

  function addCustomField() {
    const trimmed = customField.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/\s+/g, "-");
    addMapping(id, trimmed);
    setCustomField("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PROPNEX_FIELD_PRESETS.map((preset) => {
          const mapped = mappings.some((m) => m.propnexField === preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              disabled={mapped}
              onClick={() => addMapping(preset.id, preset.label)}
              className="rounded-lg border border-propnex-border bg-propnex-bg px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-propnex-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="mr-1 inline size-3" />
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={customField}
          onChange={(e) => setCustomField(e.target.value)}
          placeholder="Custom field name"
          className="h-9 flex-1 rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
        />
        <Button size="sm" variant="outline" onClick={addCustomField}>
          Add custom
        </Button>
      </div>

      {mappings.length === 0 ? (
        <p className="text-sm text-propnex-muted">
          No column mappings configured. Add fields above to map spreadsheet
          columns to PropNex AI fields.
        </p>
      ) : (
        <div className="space-y-2">
          {mappings.map((mapping, idx) => (
            <div
              key={`${mapping.propnexField}-${idx}`}
              className="flex items-center gap-3 rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2"
            >
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {mapping.label}
              </span>
              <span className="text-propnex-muted">→</span>
              <select
                value={mapping.spreadsheetColumn}
                onChange={(e) => {
                  const updated = [...mappings];
                  updated[idx] = {
                    ...mapping,
                    spreadsheetColumn: e.target.value,
                  };
                  onChange(updated);
                }}
                className="h-8 rounded-md border border-propnex-border bg-propnex-panel px-2 text-xs"
              >
                {availableColumns.map((col) => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onChange(mappings.filter((_, i) => i !== idx))}
                className="text-propnex-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
