"use client";

import {
  ProviderFormActions,
  SetupFormField,
} from "@/components/setup/provider-form-actions";
import { useSetupStore } from "@/stores/setup-store";

export function TwilioConfigForm() {
  const config = useSetupStore((state) => state.providerConfigs.twilio);
  const connectionTested = useSetupStore((state) => state.connectionTested.twilio);
  const updateTwilioConfig = useSetupStore((state) => state.updateTwilioConfig);

  return (
    <div className="space-y-5">
      <SetupFormField
        id="twilio-account-sid"
        label="Account SID"
        value={config.accountSid}
        onChange={(value) => updateTwilioConfig({ accountSid: value })}
        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      />
      <SetupFormField
        id="twilio-auth-token"
        label="Auth Token"
        value={config.authToken}
        onChange={(value) => updateTwilioConfig({ authToken: value })}
        type="password"
        placeholder="Your auth token"
      />
      <SetupFormField
        id="twilio-default-number"
        label="Default Phone Number"
        value={config.defaultPhoneNumber}
        onChange={(value) => updateTwilioConfig({ defaultPhoneNumber: value })}
        placeholder="+15550123456"
      />
      <ProviderFormActions canSave={connectionTested} />
    </div>
  );
}
