import { isValidE164Phone } from "@/lib/csv-import";
import type { PhoneNumber } from "@/lib/phone-numbers-data";

export type TelephonyProvider = "twilio" | "exotel" | "propnex";
export type ConnectionStatus =
  | "connected"
  | "warning"
  | "disconnected"
  | "untested";
export type OverflowHandling = "queue" | "reject" | "forward";
export type VirtualNumberStatus = "active" | "disabled";
export type PropNexEnvironment = "production" | "sandbox";

export type TwilioConfig = {
  accountSid: string;
  authToken: string;
  defaultPhoneNumber: string;
};

export type ExotelConfig = {
  apiKey: string;
  apiSecret: string;
  exophoneNumber: string;
};

export type PropNexServerConfig = {
  region: string;
  environment: PropNexEnvironment;
};

export type ProviderConfigs = {
  twilio: TwilioConfig;
  exotel: ExotelConfig;
  propnex: PropNexServerConfig;
};

export type ChannelUsage = {
  totalAssigned: number;
  active: number;
  reserved: number;
};

export type ChannelSettings = {
  maxConcurrentCalls: number;
  callQueueLimit: number;
  overflowHandling: OverflowHandling;
};

export type ConnectionHealth = {
  providerStatus: ConnectionStatus;
  sipStatus: ConnectionStatus;
  apiConnectivity: ConnectionStatus;
  voiceServiceStatus: ConnectionStatus;
  lastSuccessfulConnection: string;
};

export type TestResult = {
  status: "success" | "error";
  responseTimeMs: number;
  message: string;
};

export type ConfigurationSummary = {
  activeProvider: string;
  connectedNumbers: number;
  assignedChannels: number;
  connectionStatus: ConnectionStatus;
  environment: string;
};

export type ProviderOption = {
  id: TelephonyProvider;
  name: string;
  description: string;
};

export const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: "twilio",
    name: "Twilio",
    description:
      "Connect your Twilio account for global voice infrastructure and SIP trunking.",
  },
  {
    id: "exotel",
    name: "Exotel",
    description:
      "Integrate Exotel for India-focused telephony with Exophone routing.",
  },
  {
    id: "propnex",
    name: "PropNex AI Server",
    description:
      "Use the managed PropNex AI voice server with regional deployment options.",
  },
];

export const PROPNEX_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
] as const;

export const INITIAL_CHANNEL_USAGE: ChannelUsage = {
  totalAssigned: 24,
  active: 18,
  reserved: 4,
};

export const DEFAULT_CHANNEL_SETTINGS: ChannelSettings = {
  maxConcurrentCalls: 20,
  callQueueLimit: 50,
  overflowHandling: "queue",
};

export const DEFAULT_PROVIDER_CONFIGS: ProviderConfigs = {
  twilio: { accountSid: "", authToken: "", defaultPhoneNumber: "" },
  exotel: { apiKey: "", apiSecret: "", exophoneNumber: "" },
  propnex: { region: "us-east-1", environment: "production" },
};

export const INITIAL_CONNECTION_HEALTH: ConnectionHealth = {
  providerStatus: "disconnected",
  sipStatus: "disconnected",
  apiConnectivity: "disconnected",
  voiceServiceStatus: "disconnected",
  lastSuccessfulConnection: "Never",
};

export const OVERFLOW_OPTIONS: {
  value: OverflowHandling;
  label: string;
}[] = [
  { value: "queue", label: "Queue Calls" },
  { value: "reject", label: "Reject Calls" },
  { value: "forward", label: "Forward Calls" },
];

export const PROVIDER_LABELS: Record<TelephonyProvider, string> = {
  twilio: "Twilio",
  exotel: "Exotel",
  propnex: "PropNex AI Server",
};

export function validateTwilioConfig(config: TwilioConfig): string | null {
  if (!config.accountSid.trim()) {
    return "Account SID is required.";
  }
  if (!config.accountSid.trim().startsWith("AC")) {
    return "Account SID must start with AC.";
  }
  if (!config.authToken.trim()) {
    return "Auth Token is required.";
  }
  if (config.authToken.trim().length < 16) {
    return "Auth Token must be at least 16 characters.";
  }
  if (!config.defaultPhoneNumber.trim()) {
    return "Default phone number is required.";
  }
  if (!isValidE164Phone(config.defaultPhoneNumber.trim())) {
    return "Default phone number must be in E.164 format.";
  }
  return null;
}

export function validateExotelConfig(config: ExotelConfig): string | null {
  if (!config.apiKey.trim()) {
    return "API Key is required.";
  }
  if (!config.apiSecret.trim()) {
    return "API Secret is required.";
  }
  if (!config.exophoneNumber.trim()) {
    return "Exophone number is required.";
  }
  if (!isValidE164Phone(config.exophoneNumber.trim())) {
    return "Exophone number must be in E.164 format.";
  }
  return null;
}

export function validatePropNexConfig(config: PropNexServerConfig): string | null {
  if (!config.region) {
    return "Region is required.";
  }
  if (!config.environment) {
    return "Environment is required.";
  }
  return null;
}

export function validateProviderCredentials(
  provider: TelephonyProvider,
  configs: ProviderConfigs,
): string | null {
  switch (provider) {
    case "twilio":
      return validateTwilioConfig(configs.twilio);
    case "exotel":
      return validateExotelConfig(configs.exotel);
    case "propnex":
      return validatePropNexConfig(configs.propnex);
    default:
      return "Unknown provider.";
  }
}

function randomLatency(): number {
  return Math.floor(Math.random() * 121) + 80;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateConnectionTest(
  provider: TelephonyProvider,
  configs: ProviderConfigs,
): Promise<TestResult> {
  const validationError = validateProviderCredentials(provider, configs);
  if (validationError) {
    await delay(800);
    return {
      status: "error",
      responseTimeMs: 0,
      message: validationError,
    };
  }

  await delay(1000 + Math.floor(Math.random() * 1000));

  return {
    status: "success",
    responseTimeMs: randomLatency(),
    message: `Successfully connected to ${PROVIDER_LABELS[provider]}.`,
  };
}

export function buildHealthyConnectionState(
  responseTimeMs: number,
): ConnectionHealth {
  const now = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    providerStatus: "connected",
    sipStatus: responseTimeMs > 150 ? "warning" : "connected",
    apiConnectivity: "connected",
    voiceServiceStatus: "connected",
    lastSuccessfulConnection: now,
  };
}

export function buildConfigurationSummary(input: {
  activeProvider: TelephonyProvider | null;
  connectionStatus: Record<TelephonyProvider, ConnectionStatus>;
  channelUsage: ChannelUsage;
  providerConfigs: ProviderConfigs;
  phoneNumbers: PhoneNumber[];
}): ConfigurationSummary {
  const provider = input.activeProvider;
  const activeNumbers = input.phoneNumbers.filter(
    (n) => n.status === "active",
  ).length;

  return {
    activeProvider: provider ? PROVIDER_LABELS[provider] : "None selected",
    connectedNumbers: activeNumbers,
    assignedChannels: input.channelUsage.totalAssigned,
    connectionStatus: provider
      ? input.connectionStatus[provider]
      : "untested",
    environment:
      provider === "propnex"
        ? input.providerConfigs.propnex.environment === "production"
          ? "Production"
          : "Sandbox"
        : provider
          ? "Production"
          : "—",
  };
}

export function formatConnectionStatus(status: ConnectionStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "warning":
      return "Warning";
    case "disconnected":
      return "Disconnected";
    case "untested":
      return "Not tested";
  }
}
