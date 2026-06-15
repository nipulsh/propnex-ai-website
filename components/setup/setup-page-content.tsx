"use client";

import { PageHeader } from "@/components/common/page-header";
import { ChannelConfiguration } from "@/components/setup/channel-configuration";
import { ConfigurationSummary } from "@/components/setup/configuration-summary";
import { ConnectionMonitoring } from "@/components/setup/connection-monitoring";
import { ProviderConfigPanel } from "@/components/setup/provider-config-panel";
import { ProviderSelection } from "@/components/setup/provider-selection";
import { SetupBanner } from "@/components/setup/setup-banner";
import { SetupPageActions } from "@/components/setup/setup-page-actions";
import { SetupSection } from "@/components/setup/setup-section";
import { TestEnvironment } from "@/components/setup/test-environment";
import { VirtualNumbersSection } from "@/components/setup/virtual-numbers-section";
import { useSetupStore } from "@/stores/setup-store";

export function SetupPageContent() {
  const banner = useSetupStore((state) => state.banner);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Setup"
          description="Configure your telephony infrastructure and connect supported providers for AI voice operations."
        />
        <SetupPageActions />
      </div>

      {banner ? <SetupBanner type={banner.type} message={banner.message} /> : null}

      <div className="lg:hidden">
        <ConfigurationSummary />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <SetupSection
            title="Provider Selection"
            description="Choose one telephony provider to power your AI voice operations."
          >
            <ProviderSelection />
          </SetupSection>

          <ProviderConfigPanel />
          <ChannelConfiguration />
          <VirtualNumbersSection />
          <ConnectionMonitoring />
          <TestEnvironment />
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-6">
            <ConfigurationSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
