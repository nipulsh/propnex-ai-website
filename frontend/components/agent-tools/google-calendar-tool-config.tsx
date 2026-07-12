"use client";

import type { GoogleCalendarToolConfig } from "@/lib/tools/types";

type GoogleCalendarToolConfigFormProps = {
  config: GoogleCalendarToolConfig;
  onChange: (config: GoogleCalendarToolConfig) => void;
};

const PERMISSIONS = [
  { key: "checkAvailability" as const, label: "Check Availability" },
  { key: "createEvents" as const, label: "Create Events" },
  { key: "rescheduleEvents" as const, label: "Reschedule Events" },
  { key: "cancelEvents" as const, label: "Cancel Events" },
];

export function GoogleCalendarToolConfigForm({
  config,
  onChange,
}: GoogleCalendarToolConfigFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-propnex-muted">
        Control what calendar actions this agent can perform during calls.
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
