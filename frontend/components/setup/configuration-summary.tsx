"use client";

import { useMemo } from "react";
import { Phone, Server } from "lucide-react";

import { ConnectionStatusBadge } from "@/components/setup/connection-status-badge";
import { buildConfigurationSummary } from "@/lib/setup-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useSetupStore } from "@/stores/setup-store";

export function ConfigurationSummary() {
  const activeProvider = useSetupStore((state) => state.activeProvider);
  const connectionStatus = useSetupStore((state) => state.connectionStatus);
  const channelUsage = useSetupStore((state) => state.channelUsage);
  const providerConfigs = useSetupStore((state) => state.providerConfigs);
  const phoneNumbers = usePhoneNumbersStore((state) => state.numbers);

  const summary = useMemo(
    () =>
      buildConfigurationSummary({
        activeProvider,
        connectionStatus,
        channelUsage,
        providerConfigs,
        phoneNumbers,
      }),
    [
      activeProvider,
      connectionStatus,
      channelUsage,
      providerConfigs,
      phoneNumbers,
    ],
  );

  const rows = [
    { label: "Active Provider", value: summary.activeProvider },
    { label: "Connected Numbers", value: summary.connectedNumbers.toString() },
    { label: "Assigned Channels", value: summary.assignedChannels.toString() },
    { label: "Environment", value: summary.environment },
  ];

  return (
    <aside className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="flex items-center gap-2">
        <Server className="size-5 text-propnex-accent" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Configuration Summary
        </h2>
      </div>
      <p className="mt-1 text-sm text-propnex-muted">
        Quick overview of your current infrastructure setup.
      </p>

      <dl className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
        <div>
          <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Connection Status
          </dt>
          <dd className="mt-1">
            <ConnectionStatusBadge status={summary.connectionStatus} />
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-propnex-border bg-propnex-bg/50 px-3 py-2.5 text-xs text-propnex-muted">
        <Phone className="size-3.5 shrink-0" />
        Infrastructure ready for AI voice agent deployment
      </div>
    </aside>
  );
}
