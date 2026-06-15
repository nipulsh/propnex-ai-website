"use client";

import { ChevronDown } from "lucide-react";

import { ConnectionStatusBadge } from "@/components/setup/connection-status-badge";
import { ProviderFormActions } from "@/components/setup/provider-form-actions";
import { PROPNEX_REGIONS } from "@/lib/setup-data";
import { useSetupStore } from "@/stores/setup-store";

export function PropNexServerConfigForm() {
  const config = useSetupStore((state) => state.providerConfigs.propnex);
  const connectionHealth = useSetupStore((state) => state.connectionHealth);
  const connectionTested = useSetupStore((state) => state.connectionTested.propnex);
  const updatePropNexConfig = useSetupStore((state) => state.updatePropNexConfig);

  const latencyMs =
    connectionHealth.apiConnectivity === "connected" ? "94 ms" : "—";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="propnex-region"
          className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
        >
          Region
        </label>
        <div className="relative">
          <select
            id="propnex-region"
            value={config.region}
            onChange={(event) =>
              updatePropNexConfig({ region: event.target.value })
            }
            className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
          >
            {PROPNEX_REGIONS.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="propnex-environment"
          className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
        >
          Environment
        </label>
        <div className="relative">
          <select
            id="propnex-environment"
            value={config.environment}
            onChange={(event) =>
              updatePropNexConfig({
                environment: event.target.value as "production" | "sandbox",
              })
            }
            className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
          >
            <option value="production">Production</option>
            <option value="sandbox">Sandbox</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-propnex-border bg-propnex-bg/50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Server Status
          </p>
          <div className="mt-2">
            <ConnectionStatusBadge status={connectionHealth.providerStatus} />
          </div>
        </div>
        <div>
          <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Service Availability
          </p>
          <div className="mt-2">
            <ConnectionStatusBadge status={connectionHealth.voiceServiceStatus} />
          </div>
        </div>
        <div>
          <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Latency Indicator
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">{latencyMs}</p>
        </div>
      </div>

      <ProviderFormActions canSave={connectionTested} />
    </div>
  );
}
