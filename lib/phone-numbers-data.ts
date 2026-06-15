import { agents } from "@/lib/agents-data";

export type PhoneNumberLabel =
  | "SUPPORT"
  | "MAIN"
  | "OUTBOUND"
  | "SALES"
  | "VIP"
  | "AFTER HOURS";

export type PhoneNumber = {
  id: string;
  number: string;
  labels: PhoneNumberLabel[];
  agentId: string;
  agentName: string;
};

export type LabelFilter = "all" | PhoneNumberLabel;

export const LABEL_OPTIONS: { value: LabelFilter; label: string }[] = [
  { value: "all", label: "All Labels" },
  { value: "SUPPORT", label: "Support" },
  { value: "MAIN", label: "Main" },
  { value: "OUTBOUND", label: "Outbound" },
  { value: "SALES", label: "Sales" },
  { value: "VIP", label: "VIP" },
  { value: "AFTER HOURS", label: "After Hours" },
];

export const ADD_NUMBER_LABEL_OPTIONS: PhoneNumberLabel[] = [
  "SUPPORT",
  "MAIN",
  "OUTBOUND",
  "SALES",
  "VIP",
  "AFTER HOURS",
];

export const PHONE_NUMBER_STATS = {
  totalCallVolume: 12482,
  volumeTrend: "+14% from last month",
  averageResponseTime: "0.8s",
  responseTimeContext: "Across all gateways",
  activeRegions: "8 Countries",
  regionsContext: "Distributed architecture",
} as const;

const agent = (id: string) => {
  const found = agents.find((a) => a.id === id);
  return { agentId: id, agentName: found?.name ?? "Unassigned" };
};

export const initialPhoneNumbers: PhoneNumber[] = [
  {
    id: "pn-001",
    number: "+15550123456",
    labels: ["SUPPORT", "MAIN"],
    ...agent("elysian-primary"),
  },
  {
    id: "pn-002",
    number: "+15559876543",
    labels: ["OUTBOUND", "SALES"],
    ...agent("vortex-sales"),
  },
  {
    id: "pn-003",
    number: "+15552468135",
    labels: ["MAIN"],
    ...agent("nexus-global"),
  },
  {
    id: "pn-004",
    number: "+15553692580",
    labels: ["SUPPORT"],
    ...agent("nexus-global"),
  },
  {
    id: "pn-005",
    number: "+15557418529",
    labels: ["SALES"],
    ...agent("vortex-sales"),
  },
  {
    id: "pn-006",
    number: "+15551234567",
    labels: ["VIP"],
    ...agent("aria-concierge"),
  },
  {
    id: "pn-007",
    number: "+447911123456",
    labels: ["MAIN", "SUPPORT"],
    ...agent("elysian-primary"),
  },
  {
    id: "pn-008",
    number: "+61412345678",
    labels: ["OUTBOUND"],
    ...agent("vortex-sales"),
  },
  {
    id: "pn-009",
    number: "+15555550101",
    labels: ["AFTER HOURS"],
    ...agent("aria-concierge"),
  },
  {
    id: "pn-010",
    number: "+15555550202",
    labels: ["SUPPORT", "VIP"],
    ...agent("elysian-primary"),
  },
  {
    id: "pn-011",
    number: "+15555550303",
    labels: ["MAIN"],
    ...agent("nexus-global"),
  },
  {
    id: "pn-012",
    number: "+15555550404",
    labels: ["SALES", "OUTBOUND"],
    ...agent("vortex-sales"),
  },
];

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

  return e164;
}

export function filterPhoneNumbers(
  numbers: PhoneNumber[],
  searchQuery: string,
  agentId: string,
  label: LabelFilter,
): PhoneNumber[] {
  const query = searchQuery.trim().toLowerCase();

  return numbers.filter((entry) => {
    if (agentId !== "all" && entry.agentId !== agentId) {
      return false;
    }

    if (label !== "all" && !entry.labels.includes(label)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const displayNumber = formatPhoneDisplay(entry.number).toLowerCase();
    const labelText = entry.labels.join(" ").toLowerCase();
    const agentName = entry.agentName.toLowerCase();

    return (
      entry.number.toLowerCase().includes(query) ||
      displayNumber.includes(query) ||
      labelText.includes(query) ||
      agentName.includes(query)
    );
  });
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function phoneNumbersToCsv(numbers: PhoneNumber[]): string {
  const headers = ["#", "Number", "Labels", "Assigned Agent"];
  const rows = numbers.map((entry, index) => [
    String(index + 1),
    formatPhoneDisplay(entry.number),
    entry.labels.join(", "),
    entry.agentName,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}
