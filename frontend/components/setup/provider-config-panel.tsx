"use client";

import { ExotelConfigForm } from "@/components/setup/exotel-config-form";
import { PropNexServerConfigForm } from "@/components/setup/propnex-server-config-form";
import { TwilioConfigForm } from "@/components/setup/twilio-config-form";
import { PROVIDER_LABELS } from "@/lib/setup-data";
import { useSetupStore } from "@/stores/setup-store";

export function ProviderConfigPanel() {
  const activeProvider = useSetupStore((state) => state.activeProvider);

  if (!activeProvider) {
    return (
      <div className="rounded-xl border border-dashed border-propnex-border bg-propnex-panel/60 px-5 py-8 text-center text-sm text-propnex-muted">
        Select a provider above to configure credentials.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <p className="mb-4 text-sm text-propnex-muted">
        {PROVIDER_LABELS[activeProvider]} credentials
      </p>
      {activeProvider === "twilio" ? <TwilioConfigForm /> : null}
      {activeProvider === "exotel" ? <ExotelConfigForm /> : null}
      {activeProvider === "propnex" ? <PropNexServerConfigForm /> : null}
    </div>
  );
}
