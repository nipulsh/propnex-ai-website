"use client";

import { Cloud, Phone, Server } from "lucide-react";

import { ConnectionStatusBadge } from "@/components/setup/connection-status-badge";
import { Button } from "@/components/ui/button";
import { PROVIDER_OPTIONS, type TelephonyProvider } from "@/lib/setup-data";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/stores/setup-store";

const providerIcons: Record<TelephonyProvider, typeof Cloud> = {
  twilio: Cloud,
  exotel: Phone,
  propnex: Server,
};

export function ProviderSelection() {
  const activeProvider = useSetupStore((state) => state.activeProvider);
  const connectionStatus = useSetupStore((state) => state.connectionStatus);
  const selectProvider = useSetupStore((state) => state.selectProvider);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {PROVIDER_OPTIONS.map((provider) => {
        const Icon = providerIcons[provider.id];
        const isActive = activeProvider === provider.id;

        return (
          <article
            key={provider.id}
            className={cn(
              "flex flex-col rounded-xl border bg-propnex-panel p-5 transition-colors",
              isActive
                ? "border-propnex-accent ring-1 ring-propnex-accent/40"
                : "border-propnex-border",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-propnex-accent/10">
                <Icon className="size-5 text-propnex-accent" />
              </div>
              <ConnectionStatusBadge status={connectionStatus[provider.id]} />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{provider.name}</h3>
            <p className="mt-2 flex-1 text-sm text-propnex-muted">
              {provider.description}
            </p>
            <Button
              type="button"
              variant={isActive ? "default" : "outline"}
              onClick={() => selectProvider(provider.id)}
              className={cn(
                "mt-4 h-9 w-full",
                !isActive && "border-propnex-border bg-propnex-bg",
              )}
            >
              {isActive ? "Selected" : "Select"}
            </Button>
          </article>
        );
      })}
    </div>
  );
}
