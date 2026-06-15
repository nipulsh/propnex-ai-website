import { agents } from "@/lib/agents-data";
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

const agentRef = (id: string) => {
  const found = agents.find((a) => a.id === id);
  return {
    id,
    name: found?.name ?? "Unassigned",
  };
};

const UNASSIGNED = { id: "", name: "Unassigned" };

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

const providers: TelephonyProvider[] = ["twilio", "exotel", "propnex"];
const statuses: PhoneNumberStatus[] = [
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "inactive",
  "active",
  "disabled",
];

type SeedEntry = {
  id: string;
  number: string;
  inboundId: string;
  outboundId: string;
  inboundCalls: number;
  outboundCalls: number;
  daysAgoCreated: number;
  hoursAgoActivity: number | null;
};

const seedEntries: SeedEntry[] = [
  {
    id: "pn-001",
    number: "+15550123456",
    inboundId: "elysian-primary",
    outboundId: "vortex-sales",
    inboundCalls: 245,
    outboundCalls: 1820,
    daysAgoCreated: 120,
    hoursAgoActivity: 2,
  },
  {
    id: "pn-002",
    number: "+15559876543",
    inboundId: "nexus-global",
    outboundId: "vortex-sales",
    inboundCalls: 89,
    outboundCalls: 2104,
    daysAgoCreated: 95,
    hoursAgoActivity: 5,
  },
  {
    id: "pn-003",
    number: "+15552468135",
    inboundId: "elysian-primary",
    outboundId: "elysian-primary",
    inboundCalls: 412,
    outboundCalls: 156,
    daysAgoCreated: 80,
    hoursAgoActivity: 1,
  },
  {
    id: "pn-004",
    number: "+15553692580",
    inboundId: "nexus-global",
    outboundId: "nexus-global",
    inboundCalls: 318,
    outboundCalls: 42,
    daysAgoCreated: 70,
    hoursAgoActivity: 8,
  },
  {
    id: "pn-005",
    number: "+15557418529",
    inboundId: "aria-concierge",
    outboundId: "vortex-sales",
    inboundCalls: 56,
    outboundCalls: 987,
    daysAgoCreated: 60,
    hoursAgoActivity: 12,
  },
  {
    id: "pn-006",
    number: "+15551234567",
    inboundId: "aria-concierge",
    outboundId: "vortex-sales",
    inboundCalls: 178,
    outboundCalls: 654,
    daysAgoCreated: 55,
    hoursAgoActivity: 3,
  },
  {
    id: "pn-007",
    number: "+447911123456",
    inboundId: "elysian-primary",
    outboundId: "nexus-global",
    inboundCalls: 523,
    outboundCalls: 201,
    daysAgoCreated: 45,
    hoursAgoActivity: 6,
  },
  {
    id: "pn-008",
    number: "+61412345678",
    inboundId: "nexus-global",
    outboundId: "vortex-sales",
    inboundCalls: 12,
    outboundCalls: 1456,
    daysAgoCreated: 40,
    hoursAgoActivity: 24,
  },
  {
    id: "pn-009",
    number: "+15555550101",
    inboundId: "aria-concierge",
    outboundId: "aria-concierge",
    inboundCalls: 67,
    outboundCalls: 23,
    daysAgoCreated: 30,
    hoursAgoActivity: 48,
  },
  {
    id: "pn-010",
    number: "+15555550202",
    inboundId: "elysian-primary",
    outboundId: "vortex-sales",
    inboundCalls: 0,
    outboundCalls: 0,
    daysAgoCreated: 14,
    hoursAgoActivity: null,
  },
  {
    id: "pn-011",
    number: "+15555550303",
    inboundId: "nexus-global",
    outboundId: "elysian-primary",
    inboundCalls: 134,
    outboundCalls: 89,
    daysAgoCreated: 10,
    hoursAgoActivity: 18,
  },
  {
    id: "pn-012",
    number: "+15555550404",
    inboundId: "vortex-sales",
    outboundId: "vortex-sales",
    inboundCalls: 45,
    outboundCalls: 312,
    daysAgoCreated: 5,
    hoursAgoActivity: 72,
  },
];

function buildPhoneNumber(entry: SeedEntry, index: number): PhoneNumber {
  const inbound = entry.inboundId ? agentRef(entry.inboundId) : UNASSIGNED;
  const outbound = entry.outboundId ? agentRef(entry.outboundId) : UNASSIGNED;
  const createdAt = now - entry.daysAgoCreated * dayMs;
  const lastActivityAt =
    entry.hoursAgoActivity !== null
      ? now - entry.hoursAgoActivity * 60 * 60 * 1000
      : null;

  return {
    id: entry.id,
    number: entry.number,
    provider: providers[index % providers.length]!,
    inboundAgentId: inbound.id,
    inboundAgentName: inbound.name,
    outboundAgentId: outbound.id,
    outboundAgentName: outbound.name,
    status: statuses[index]!,
    inboundCallsCount: entry.inboundCalls,
    outboundCallsCount: entry.outboundCalls,
    lastActivityAt,
    createdAt,
    updatedAt: lastActivityAt ?? createdAt,
  };
}

export const initialPhoneNumbers: PhoneNumber[] = seedEntries.map(buildPhoneNumber);

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

export function getPhoneNumberById(id: string): PhoneNumber | undefined {
  return initialPhoneNumbers.find((entry) => entry.id === id);
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
