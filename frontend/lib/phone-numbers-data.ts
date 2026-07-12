import type { TelephonyProvider } from "@/lib/setup-data";
import { PROVIDER_LABELS } from "@/lib/setup-data";

export type PhoneNumberStatus = "active" | "inactive" | "disabled";
export type DirectionFilter = "all" | "inbound" | "outbound";
export type ProviderFilter = "all" | TelephonyProvider;
export type StatusFilter = "all" | PhoneNumberStatus;

export type PhoneNumber = {
  id: string;
  number: string;
  provider: TelephonyProvider;
  inboundAgentId: string;
  inboundAgentName: string;
  outboundAgentId: string;
  outboundAgentName: string;
  status: PhoneNumberStatus;
  inboundCallsCount: number;
  outboundCallsCount: number;
  lastActivityAt: number | null;
  createdAt: number;
  updatedAt: number;
  channelCount: number;
};

export const DIRECTION_FILTER_OPTIONS: {
  value: DirectionFilter;
  label: string;
}[] = [
  { value: "all", label: "All Calls" },
  { value: "inbound", label: "Inbound Calls" },
  { value: "outbound", label: "Outbound Calls" },
];

export const STATUS_FILTER_OPTIONS: {
  value: StatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "disabled", label: "Disabled" },
];

export const PROVIDER_FILTER_OPTIONS: {
  value: ProviderFilter;
  label: string;
}[] = [
  { value: "all", label: "All Providers" },
  { value: "twilio", label: PROVIDER_LABELS.twilio },
  { value: "exotel", label: PROVIDER_LABELS.exotel },
  { value: "propnex", label: PROVIDER_LABELS.propnex },
];

export const ADD_NUMBER_PROVIDER_OPTIONS: TelephonyProvider[] = [
  "twilio",
  "exotel",
  "propnex",
];

const dayMs = 24 * 60 * 60 * 1000;

export const initialPhoneNumbers: PhoneNumber[] = [];

export function formatPhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    const area = digits.slice(1, 4);
    const prefix = digits.slice(4, 7);
    const line = digits.slice(7, 11);
    return `+1 (${area}) ${prefix}-${line}`;
  }

  if (digits.length === 10) {
    const area = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const line = digits.slice(6, 10);
    return `+1 (${area}) ${prefix}-${line}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  if (digits.length === 11 && digits.startsWith("44")) {
    return `+44 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  if (digits.length === 11 && digits.startsWith("61")) {
    return `+61 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  return e164;
}

export function formatLastActivity(timestamp: number | null): string {
  if (timestamp === null) {
    return "No activity";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / dayMs);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function formatCreatedDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function getPhoneNumberById(_id: string): PhoneNumber | undefined {
  return undefined;
}

export function filterPhoneNumbers(
  numbers: PhoneNumber[],
  searchQuery: string,
  direction: DirectionFilter,
  status: StatusFilter,
  provider: ProviderFilter,
): PhoneNumber[] {
  const query = searchQuery.trim().toLowerCase();

  return numbers.filter((entry) => {
    if (status !== "all" && entry.status !== status) {
      return false;
    }

    if (provider !== "all" && entry.provider !== provider) {
      return false;
    }

    if (direction === "inbound" && entry.inboundCallsCount === 0) {
      return false;
    }

    if (direction === "outbound" && entry.outboundCallsCount === 0) {
      return false;
    }

    if (!query) {
      return true;
    }

    const displayNumber = formatPhoneDisplay(entry.number).toLowerCase();
    const inboundName = entry.inboundAgentName.toLowerCase();
    const outboundName = entry.outboundAgentName.toLowerCase();

    return (
      entry.number.toLowerCase().includes(query) ||
      displayNumber.includes(query) ||
      inboundName.includes(query) ||
      outboundName.includes(query)
    );
  });
}

export function computePhoneNumberListStats(numbers: PhoneNumber[]) {
  const activeCount = numbers.filter((n) => n.status === "active").length;
  const totalInbound = numbers.reduce((sum, n) => sum + n.inboundCallsCount, 0);
  const totalOutbound = numbers.reduce(
    (sum, n) => sum + n.outboundCallsCount,
    0,
  );

  return {
    totalNumbers: numbers.length,
    activeCount,
    totalInbound,
    totalOutbound,
    totalCalls: totalInbound + totalOutbound,
  };
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function phoneNumbersToCsv(numbers: PhoneNumber[]): string {
  const headers = [
    "Phone Number",
    "Provider",
    "Status",
    "Inbound Agent",
    "Outbound Agent",
    "Inbound Calls",
    "Outbound Calls",
    "Last Activity",
  ];

  const rows = numbers.map((entry) => [
    formatPhoneDisplay(entry.number),
    PROVIDER_LABELS[entry.provider],
    entry.status,
    entry.inboundAgentName,
    entry.outboundAgentName,
    String(entry.inboundCallsCount),
    String(entry.outboundCallsCount),
    formatLastActivity(entry.lastActivityAt),
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}
