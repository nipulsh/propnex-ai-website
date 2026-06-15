import { agents } from "@/lib/agents-data";

export type CallDirection = "inbound" | "outbound";

export type CallStatus = "completed" | "missed" | "voicemail" | "failed";

export type CallLog = {
  id: string;
  timestamp: number;
  direction: CallDirection;
  phoneNumber: string;
  lineLabel: string;
  agentId: string;
  agentName: string;
  status: CallStatus;
  durationSeconds: number;
};

export type DateRangeOption = "last-7-days" | "last-30-days" | "last-90-days";

export type StatusFilter = "all" | CallStatus;

export const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "last-90-days", label: "Last 90 Days" },
];

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "missed", label: "Missed" },
  { value: "voicemail", label: "Voicemail" },
  { value: "failed", label: "Failed" },
];

const PHONE_NUMBERS = [
  "+1 (555) 123-4567",
  "+1 (555) 987-6543",
  "+1 (555) 246-8135",
  "+1 (555) 369-2580",
  "+1 (555) 741-8529",
];

const LINE_LABELS = [
  "Main Office Line",
  "Support Queue A",
  "Sales Hotline",
  "After Hours Line",
  "VIP Concierge",
];

const DIRECTIONS: CallDirection[] = ["inbound", "outbound"];

const STATUSES: CallStatus[] = ["completed", "missed", "voicemail", "failed"];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function generateCallLogs(count: number): CallLog[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, index) => {
    const agent = randomItem(agents);
    const daysAgo = Math.floor(Math.random() * 90);
    const hour = Math.floor(Math.random() * 12) + 8;
    const minute = Math.floor(Math.random() * 60);
    const timestamp =
      now -
      daysAgo * dayMs -
      (24 - hour) * 60 * 60 * 1000 -
      minute * 60 * 1000 -
      index * 37_000;

    return {
      id: `call-${index + 1}`,
      timestamp,
      direction: randomItem(DIRECTIONS),
      phoneNumber: randomItem(PHONE_NUMBERS),
      lineLabel: randomItem(LINE_LABELS),
      agentId: agent.id,
      agentName: agent.name,
      status: randomItem(STATUSES),
      durationSeconds: Math.floor(Math.random() * 540) + 30,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

export const callLogs = generateCallLogs(1240);

export function formatCallDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function formatCallTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(timestamp);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getDateRangeStart(option: DateRangeOption): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const offsets: Record<DateRangeOption, number> = {
    "last-7-days": 7,
    "last-30-days": 30,
    "last-90-days": 90,
  };
  return Date.now() - offsets[option] * dayMs;
}

export function filterCallLogs(
  logs: CallLog[],
  dateRange: DateRangeOption,
  agentId: string,
  status: StatusFilter,
): CallLog[] {
  const rangeStart = getDateRangeStart(dateRange);

  return logs.filter((log) => {
    if (log.timestamp < rangeStart) return false;
    if (agentId !== "all" && log.agentId !== agentId) return false;
    if (status !== "all" && log.status !== status) return false;
    return true;
  });
}

export function callLogsToCsv(logs: CallLog[]): string {
  const headers = [
    "Date",
    "Time",
    "Direction",
    "Phone Number",
    "Line",
    "Agent",
    "Status",
    "Duration (sec)",
  ];

  const rows = logs.map((log) => [
    formatCallDate(log.timestamp),
    formatCallTime(log.timestamp),
    log.direction,
    log.phoneNumber,
    log.lineLabel,
    log.agentName,
    log.status,
    String(log.durationSeconds),
  ]);

  return [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}
