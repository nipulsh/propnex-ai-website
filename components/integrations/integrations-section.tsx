"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { IntegrationCard } from "@/components/integrations/integration-card";
import { IntegrationDetailSheet } from "@/components/integrations/integration-detail-sheet";
import {
  useActionNotification,
  usePageStatusNotification,
} from "@/hooks/use-page-status-notification";
import { INTEGRATION_DEFINITIONS } from "@/lib/integrations/registry";
import type { IntegrationId } from "@/lib/integrations/types";
import { useIntegrationsStore } from "@/stores/integrations-store";

export function IntegrationsSection() {
  const searchParams = useSearchParams();
  const integrations = useIntegrationsStore((s) => s.integrations);
  const isLoading = useIntegrationsStore((s) => s.isLoading);
  const isConnecting = useIntegrationsStore((s) => s.isConnecting);
  const banner = useIntegrationsStore((s) => s.banner);
  const fetchIntegrations = useIntegrationsStore((s) => s.fetchIntegrations);
  const connectIntegration = useIntegrationsStore((s) => s.connectIntegration);
  const disconnectIntegration = useIntegrationsStore(
    (s) => s.disconnectIntegration,
  );
  const clearBanner = useIntegrationsStore((s) => s.clearBanner);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<IntegrationId | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] =
    useState<IntegrationId | null>(null);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading integrations…",
    loadingId: "integrations-loading",
  });

  useActionNotification({
    message: banner?.message ?? null,
    type: banner?.type === "success" ? "success" : "error",
    onClear: clearBanner,
  });

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const oauthError = searchParams.get("oauth_error");
    if (oauthSuccess) {
      fetchIntegrations();
      setSelectedId(oauthSuccess as IntegrationId);
      setDetailOpen(true);
    }
    if (oauthError) {
      useIntegrationsStore.setState({
        banner: {
          type: "error",
          message: `Google connection failed: ${oauthError}`,
        },
      });
    }
  }, [searchParams, fetchIntegrations]);

  const selectedIntegration = integrations.find((i) => i.id === selectedId) ?? null;
  const connectedCount = integrations.filter(
    (i) => i.status === "connected" || i.status === "syncing",
  ).length;

  function handleManage(id: IntegrationId) {
    setSelectedId(id);
    setDetailOpen(true);
  }

  async function handleConnect(id: IntegrationId) {
    await connectIntegration(id);
    setSelectedId(id);
    setDetailOpen(true);
  }

  async function handleDisconnect(id: IntegrationId) {
    if (confirmDisconnect !== id) {
      setConfirmDisconnect(id);
      return;
    }
    await disconnectIntegration(id);
    setConfirmDisconnect(null);
    setDetailOpen(false);
    setSelectedId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
        <p className="mt-1 text-sm text-propnex-muted">
          Connect third-party services that agents can access during live
          conversations. {connectedCount} of{" "}
          {INTEGRATION_DEFINITIONS.filter((d) => d.available).length} connected.
        </p>
      </div>

      {confirmDisconnect ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <p className="text-foreground">
            Disconnect this integration? Agents will lose access to this
            service.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleDisconnect(confirmDisconnect)}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white"
            >
              Confirm disconnect
            </button>
            <button
              type="button"
              onClick={() => setConfirmDisconnect(null)}
              className="rounded-md border border-propnex-border px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATION_DEFINITIONS.map((definition) => {
          const integration = integrations.find(
            (i) => i.id === definition.id,
          );
          return (
            <IntegrationCard
              key={definition.id}
              definition={definition}
              integration={integration}
              isConnecting={isConnecting}
              onConnect={() => handleConnect(definition.id)}
              onManage={() => handleManage(definition.id)}
              onDisconnect={() => handleDisconnect(definition.id)}
            />
          );
        })}
      </div>

      <IntegrationDetailSheet
        integration={selectedIntegration}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
