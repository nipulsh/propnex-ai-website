"use client";

import type { GoogleSheetsToolConfig } from "@/lib/tools/types";

type GoogleSheetsToolConfigFormProps = {
  config: GoogleSheetsToolConfig;
  onChange: (config: GoogleSheetsToolConfig) => void;
};

const PERMISSIONS = [
  { key: "readRecords" as const, label: "Read Customer Records" },
  { key: "createRecords" as const, label: "Create New Records" },
  { key: "updateRecords" as const, label: "Update Existing Records" },
  { key: "saveCallOutcomes" as const, label: "Save Call Outcomes" },
  { key: "saveNotes" as const, label: "Save Notes" },
  { key: "saveLeadScores" as const, label: "Save Lead Scores" },
];

export function GoogleSheetsToolConfigForm({
  config,
  onChange,
}: GoogleSheetsToolConfigFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-propnex-muted">
        Control what spreadsheet actions this agent can perform during calls.
      </p>
      {PERMISSIONS.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center justify-between rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3 text-sm"
        >
          <span className="font-medium text-foreground">{label}</span>
          <input
            type="checkbox"
            checked={config.permissions[key]}
            onChange={(e) =>
              onChange({
                permissions: {
                  ...config.permissions,
                  [key]: e.target.checked,
                },
              })
            }
            className="size-4"
          />
        </label>
      ))}
    </div>
  );
}
