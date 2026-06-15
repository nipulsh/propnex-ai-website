import { create } from "zustand";

import { isValidE164Phone } from "@/lib/csv-import";
import { getAgentsList } from "@/stores/agents-store";
import {
  DEFAULT_CHANNEL_SETTINGS,
  DEFAULT_PROVIDER_CONFIGS,
  INITIAL_CHANNEL_USAGE,
  INITIAL_CONNECTION_HEALTH,
  buildHealthyConnectionState,
  simulateConnectionTest,
  validateProviderCredentials,
  type ChannelSettings,
  type ChannelUsage,
  type ConnectionHealth,
  type ConnectionStatus,
  type ExotelConfig,
  type PropNexServerConfig,
  type ProviderConfigs,
  type TelephonyProvider,
  type TestResult,
  type TwilioConfig,
  type VirtualNumberStatus,
} from "@/lib/setup-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useUsageStore } from "@/stores/usage-store";

type Banner = {
  type: "success" | "error";
  message: string;
};

type TestEnvironmentState = {
  phoneNumber: string;
  result: TestResult | null;
  isTesting: boolean;
};

const INITIAL_CONNECTION_STATUS: Record<TelephonyProvider, ConnectionStatus> = {
  twilio: "untested",
  exotel: "untested",
  propnex: "untested",
};

const INITIAL_CONNECTION_TESTED: Record<TelephonyProvider, boolean> = {
  twilio: false,
  exotel: false,
  propnex: false,
};

type SetupStore = {
  activeProvider: TelephonyProvider | null;
  providerConfigs: ProviderConfigs;
  connectionStatus: Record<TelephonyProvider, ConnectionStatus>;
  connectionTested: Record<TelephonyProvider, boolean>;
  channelUsage: ChannelUsage;
  channelSettings: ChannelSettings;
  connectionHealth: ConnectionHealth;
  testEnvironment: TestEnvironmentState;
  virtualNumberStatuses: Record<string, VirtualNumberStatus>;
  isSaving: boolean;
  isTesting: boolean;
  banner: Banner | null;
  selectProvider: (provider: TelephonyProvider) => void;
  updateTwilioConfig: (partial: Partial<TwilioConfig>) => void;
  updateExotelConfig: (partial: Partial<ExotelConfig>) => void;
  updatePropNexConfig: (partial: Partial<PropNexServerConfig>) => void;
  testConnection: () => Promise<void>;
  saveConfiguration: () => Promise<void>;
  updateChannelSettings: (partial: Partial<ChannelSettings>) => void;
  setTestPhoneNumber: (value: string) => void;
  runTestConnection: () => Promise<void>;
  runTestCall: () => Promise<void>;
  setVirtualNumberStatus: (id: string, status: VirtualNumberStatus) => void;
  assignAgent: (id: string, agentId: string) => void;
  unassignAgent: (id: string) => void;
  clearBanner: () => void;
};

function clearTestedForProvider(
  tested: Record<TelephonyProvider, boolean>,
  provider: TelephonyProvider,
): Record<TelephonyProvider, boolean> {
  return { ...tested, [provider]: false };
}

export const useSetupStore = create<SetupStore>((set, get) => ({
  activeProvider: null,
  providerConfigs: { ...DEFAULT_PROVIDER_CONFIGS },
  connectionStatus: { ...INITIAL_CONNECTION_STATUS },
  connectionTested: { ...INITIAL_CONNECTION_TESTED },
  channelUsage: { ...INITIAL_CHANNEL_USAGE },
  channelSettings: { ...DEFAULT_CHANNEL_SETTINGS },
  connectionHealth: { ...INITIAL_CONNECTION_HEALTH },
  testEnvironment: {
    phoneNumber: "",
    result: null,
    isTesting: false,
  },
  virtualNumberStatuses: {},
  isSaving: false,
  isTesting: false,
  banner: null,

  selectProvider: (provider) =>
    set({
      activeProvider: provider,
      banner: null,
    }),

  updateTwilioConfig: (partial) =>
    set((state) => ({
      providerConfigs: {
        ...state.providerConfigs,
        twilio: { ...state.providerConfigs.twilio, ...partial },
      },
      connectionTested: clearTestedForProvider(state.connectionTested, "twilio"),
      connectionStatus: { ...state.connectionStatus, twilio: "untested" },
      banner: null,
    })),

  updateExotelConfig: (partial) =>
    set((state) => ({
      providerConfigs: {
        ...state.providerConfigs,
        exotel: { ...state.providerConfigs.exotel, ...partial },
      },
      connectionTested: clearTestedForProvider(state.connectionTested, "exotel"),
      connectionStatus: { ...state.connectionStatus, exotel: "untested" },
      banner: null,
    })),

  updatePropNexConfig: (partial) =>
    set((state) => ({
      providerConfigs: {
        ...state.providerConfigs,
        propnex: { ...state.providerConfigs.propnex, ...partial },
      },
      connectionTested: clearTestedForProvider(state.connectionTested, "propnex"),
      connectionStatus: { ...state.connectionStatus, propnex: "untested" },
      banner: null,
    })),

  testConnection: async () => {
    const { activeProvider, providerConfigs } = get();
    if (!activeProvider) {
      set({
        banner: {
          type: "error",
          message: "Select a provider before testing the connection.",
        },
      });
      return;
    }

    set({ isTesting: true, banner: null });

    const result = await simulateConnectionTest(activeProvider, providerConfigs);

    if (result.status === "success") {
      const health = buildHealthyConnectionState(result.responseTimeMs);
      set((state) => ({
        isTesting: false,
        connectionTested: {
          ...state.connectionTested,
          [activeProvider]: true,
        },
        connectionStatus: {
          ...state.connectionStatus,
          [activeProvider]: "connected",
        },
        connectionHealth: health,
        banner: {
          type: "success",
          message: result.message,
        },
      }));
      return;
    }

    set((state) => ({
      isTesting: false,
      connectionStatus: {
        ...state.connectionStatus,
        [activeProvider]: "disconnected",
      },
      banner: {
        type: "error",
        message: result.message,
      },
    }));
  },

  saveConfiguration: async () => {
    const { activeProvider, providerConfigs, connectionTested } = get();

    if (!activeProvider) {
      set({
        banner: {
          type: "error",
          message: "Select a provider before saving.",
        },
      });
      return;
    }

    const validationError = validateProviderCredentials(
      activeProvider,
      providerConfigs,
    );
    if (validationError) {
      set({
        banner: { type: "error", message: validationError },
      });
      return;
    }

    if (!connectionTested[activeProvider]) {
      set({
        banner: {
          type: "error",
          message: "Run Test Connection before saving.",
        },
      });
      return;
    }

    set({ isSaving: true, banner: null });
    await new Promise((resolve) => setTimeout(resolve, 600));

    set({
      isSaving: false,
      banner: {
        type: "success",
        message: "Configuration saved successfully.",
      },
    });
  },

  updateChannelSettings: (partial) =>
    set((state) => ({
      channelSettings: { ...state.channelSettings, ...partial },
    })),

  setTestPhoneNumber: (value) =>
    set((state) => ({
      testEnvironment: {
        ...state.testEnvironment,
        phoneNumber: value,
        result: null,
      },
    })),

  runTestConnection: async () => {
    const { activeProvider, providerConfigs } = get();
    if (!activeProvider) {
      set({
        testEnvironment: {
          phoneNumber: get().testEnvironment.phoneNumber,
          isTesting: false,
          result: {
            status: "error",
            responseTimeMs: 0,
            message: "Select and configure a provider first.",
          },
        },
      });
      return;
    }

    set((state) => ({
      testEnvironment: { ...state.testEnvironment, isTesting: true, result: null },
    }));

    const result = await simulateConnectionTest(activeProvider, providerConfigs);

    set((state) => ({
      testEnvironment: {
        ...state.testEnvironment,
        isTesting: false,
        result,
      },
    }));
  },

  runTestCall: async () => {
    const { testEnvironment, activeProvider, connectionTested } = get();
    const trimmed = testEnvironment.phoneNumber.trim();

    if (!trimmed) {
      set({
        testEnvironment: {
          ...testEnvironment,
          isTesting: false,
          result: {
            status: "error",
            responseTimeMs: 0,
            message: "Enter a test phone number.",
          },
        },
      });
      return;
    }

    if (!isValidE164Phone(trimmed)) {
      set({
        testEnvironment: {
          ...testEnvironment,
          isTesting: false,
          result: {
            status: "error",
            responseTimeMs: 0,
            message: "Use E.164 format (e.g. +15550123456).",
          },
        },
      });
      return;
    }

    if (!activeProvider || !connectionTested[activeProvider]) {
      set({
        testEnvironment: {
          ...testEnvironment,
          isTesting: false,
          result: {
            status: "error",
            responseTimeMs: 0,
            message: "Test and save provider connection before placing a test call.",
          },
        },
      });
      return;
    }

    set({
      testEnvironment: { ...testEnvironment, isTesting: true, result: null },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const testCallDurationSeconds = 45 + Math.floor(Math.random() * 90);
    useUsageStore.getState().recordCallUsage(testCallDurationSeconds);

    set({
      testEnvironment: {
        phoneNumber: trimmed,
        isTesting: false,
        result: {
          status: "success",
          responseTimeMs: Math.floor(Math.random() * 100) + 120,
          message: `Test call initiated to ${trimmed}.`,
        },
      },
    });
  },

  setVirtualNumberStatus: (id, status) => {
    usePhoneNumbersStore.getState().setNumberStatus(id, status);
    set((state) => ({
      virtualNumberStatuses: { ...state.virtualNumberStatuses, [id]: status },
    }));
  },

  assignAgent: (id, agentId) => {
    const agent = getAgentsList().find((entry) => entry.id === agentId);
    if (!agent) {
      return;
    }
    usePhoneNumbersStore.getState().setInboundAgent(id, agent.id, agent.name);
  },

  unassignAgent: (id) => {
    usePhoneNumbersStore.getState().setInboundAgent(id, "", "Unassigned");
  },

  clearBanner: () => set({ banner: null }),
}));
