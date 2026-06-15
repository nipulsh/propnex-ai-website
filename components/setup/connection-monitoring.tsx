"use client";

import { ConnectionStatusBadge } from "@/components/setup/connection-status-badge";
import { SetupSection } from "@/components/setup/setup-section";
import { useSetupStore } from "@/stores/setup-store";

const healthItems = [
  { key: "providerStatus" as const, label: "Provider Status" },
  { key: "sipStatus" as const, label: "SIP Connection Status" },
  { key: "apiConnectivity" as const, label: "API Connectivity" },
  { key: "voiceServiceStatus" as const, label: "Voice Service Status" },
];

export function ConnectionMonitoring() {
  const connectionHealth = useSetupStore((state) => state.connectionHealth);

  return (
    <SetupSection
      title="Connection Monitoring"
      description="Real-time health indicators for your telephony infrastructure."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {healthItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-propnex-border bg-propnex-bg/50 px-4 py-3"
            >
              <span className="text-sm text-propnex-muted">{item.label}</span>
              <ConnectionStatusBadge status={connectionHealth[item.key]} />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-propnex-border bg-propnex-bg/50 px-4 py-3 sm:col-span-2">
            <span className="text-sm text-propnex-muted">
              Last Successful Connection
            </span>
            <span className="text-sm font-medium text-foreground">
              {connectionHealth.lastSuccessfulConnection}
            </span>
          </div>
        </div>
      </div>
    </SetupSection>
  );
}
