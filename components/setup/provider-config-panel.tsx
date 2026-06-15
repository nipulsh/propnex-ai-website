"use client";

import { ExotelConfigForm } from "@/components/setup/exotel-config-form";
import { PropNexServerConfigForm } from "@/components/setup/propnex-server-config-form";
import { SetupSection } from "@/components/setup/setup-section";
import { TwilioConfigForm } from "@/components/setup/twilio-config-form";
import { PROVIDER_LABELS } from "@/lib/setup-data";
import { useSetupStore } from "@/stores/setup-store";

export function ProviderConfigPanel() {
  const activeProvider = useSetupStore((state) => state.activeProvider);

  if (!activeProvider) {
    return (
      <SetupSection
        title="Provider Configuration"
        description="Select a provider above to configure credentials and connection settings."
      >
        <div className="rounded-xl border border-dashed border-propnex-border bg-propnex-panel/60 px-5 py-12 text-center text-sm text-propnex-muted">
          No provider selected. Choose Twilio, Exotel, or PropNex AI Server to
          continue.
        </div>
      </SetupSection>
    );
  }

  return (
    <SetupSection
      title="Provider Configuration"
      description={`Configure credentials and settings for ${PROVIDER_LABELS[activeProvider]}.`}
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        {activeProvider === "twilio" ? <TwilioConfigForm /> : null}
        {activeProvider === "exotel" ? <ExotelConfigForm /> : null}
        {activeProvider === "propnex" ? <PropNexServerConfigForm /> : null}
      </div>
    </SetupSection>
  );
}
