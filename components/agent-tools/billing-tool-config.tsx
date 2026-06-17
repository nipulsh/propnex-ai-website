"use client";

import type { BillingToolConfig } from "@/lib/tools/types";

type BillingToolConfigFormProps = {
  config: BillingToolConfig;
  onChange: (config: BillingToolConfig) => void;
};

const PERMISSIONS = [
  { key: "creditAccess" as const, label: "Credit Access", desc: "Available credits and usage" },
  { key: "planAccess" as const, label: "Plan Access", desc: "Active subscription plan" },
  { key: "invoiceAccess" as const, label: "Invoice Access", desc: "Invoice and payment status" },
];

export function BillingToolConfigForm({
  config,
  onChange,
}: BillingToolConfigFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-propnex-muted">
        Configure which billing information this agent can access during calls.
      </p>
      {PERMISSIONS.map(({ key, label, desc }) => (
        <label
          key={key}
          className="flex items-center justify-between rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-propnex-muted">{desc}</p>
          </div>
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
