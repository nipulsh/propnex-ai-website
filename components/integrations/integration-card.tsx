"use client";

import { Settings2, Unplug } from "lucide-react";

import { IntegrationStatusBadge } from "@/components/integrations/integration-status-badge";
import { OAuthConnectButton } from "@/components/integrations/oauth-connect-button";
import { Button } from "@/components/ui/button";
import type { IntegrationDefinition } from "@/lib/integrations/registry";
import type { WorkspaceIntegration } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

type IntegrationCardProps = {
  definition: IntegrationDefinition;
  integration?: WorkspaceIntegration;
  isConnecting: boolean;
  onConnect: () => void;
  onManage: () => void;
  onDisconnect: () => void;
};

function formatLastSync(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString();
}

export function IntegrationCard({
  definition,
  integration,
  isConnecting,
  onConnect,
  onManage,
  onDisconnect,
}: IntegrationCardProps) {
  const Icon = definition.icon;
  const status = integration?.status ?? "not_connected";
  const isConnected = status === "connected" || status === "syncing";

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-propnex-border bg-propnex-panel p-5",
        definition.comingSoon && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-propnex-accent/15 text-propnex-accent">
          <Icon className="size-5" />
        </div>
        <IntegrationStatusBadge status={status} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-foreground">
        {definition.name}
        {definition.comingSoon ? (
          <span className="ml-2 text-xs font-normal text-propnex-muted">
            Coming soon
          </span>
        ) : null}
      </h3>
      <p className="mt-2 flex-1 text-sm text-propnex-muted">
        {definition.description}
      </p>

      {isConnected && integration ? (
        <div className="mt-4 space-y-1 rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-xs">
          <div className="flex justify-between">
            <span className="text-propnex-muted">Account</span>
            <span className="font-medium text-foreground">
              {integration.connectedAccount ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-propnex-muted">Last sync</span>
            <span className="text-foreground">
              {formatLastSync(integration.lastSyncAt)}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {definition.comingSoon ? (
          <Button size="sm" variant="outline" disabled>
            Coming soon
          </Button>
        ) : isConnected ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onManage}
              className="gap-1.5"
            >
              <Settings2 className="size-3.5" />
              Manage
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDisconnect}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Unplug className="size-3.5" />
              Disconnect
            </Button>
          </>
        ) : (
          <OAuthConnectButton
            onConnect={onConnect}
            isConnecting={isConnecting}
          />
        )}
      </div>
    </article>
  );
}
