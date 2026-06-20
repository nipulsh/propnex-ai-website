"use client";

import { PageHeader } from "@/components/common/page-header";
import { ChannelConfiguration } from "@/components/setup/channel-configuration";
import { ConnectionMonitoring } from "@/components/setup/connection-monitoring";
import { PhoneNumbersTable } from "@/components/setup/phone-numbers-table";
import { ProviderConfigPanel } from "@/components/setup/provider-config-panel";
import { ProviderSelection } from "@/components/setup/provider-selection";
import { SetupBanner } from "@/components/setup/setup-banner";
import { SetupPageActions } from "@/components/setup/setup-page-actions";
import { SetupSection } from "@/components/setup/setup-section";
import { useSetupGraphQL } from "@/hooks/use-setup-graphql";
import { useSetupStore } from "@/stores/setup-store";

export function SetupPageContent() {
  useSetupGraphQL();
  const banner = useSetupStore((state) => state.banner);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Setup"
          description="Configure phone numbers, channels, and your telephony connection."
        />
        <SetupPageActions />
      </div>

      {banner ? <SetupBanner type={banner.type} message={banner.message} /> : null}

      <div className="flex min-w-0 flex-col gap-6">
        <PhoneNumbersTable />
        <ChannelConfiguration />
        <SetupSection
          title="Telephony Provider"
          description="Connect your voice provider for AI calling."
        >
          <ProviderSelection />
          <ProviderConfigPanel />
        </SetupSection>
        <ConnectionMonitoring />
      </div>
    </div>
  );
}
