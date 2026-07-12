"use client";

import {
  ProviderFormActions,
  SetupFormField,
} from "@/components/setup/provider-form-actions";
import { useSetupStore } from "@/stores/setup-store";

export function ExotelConfigForm() {
  const config = useSetupStore((state) => state.providerConfigs.exotel);
  const connectionTested = useSetupStore((state) => state.connectionTested.exotel);
  const updateExotelConfig = useSetupStore((state) => state.updateExotelConfig);

  return (
    <div className="space-y-5">
      <SetupFormField
        id="exotel-api-key"
        label="API Key"
        value={config.apiKey}
        onChange={(value) => updateExotelConfig({ apiKey: value })}
        placeholder="Your Exotel API key"
      />
      <SetupFormField
        id="exotel-api-secret"
        label="API Secret"
        value={config.apiSecret}
        onChange={(value) => updateExotelConfig({ apiSecret: value })}
        type="password"
        placeholder="Your Exotel API secret"
      />
      <SetupFormField
        id="exotel-exophone"
        label="Exophone Number"
        value={config.exophoneNumber}
        onChange={(value) => updateExotelConfig({ exophoneNumber: value })}
        placeholder="+9198XXXXXXXX"
      />
      <ProviderFormActions canSave={connectionTested} />
    </div>
  );
}
