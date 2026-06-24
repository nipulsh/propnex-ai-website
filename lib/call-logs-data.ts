import { agents } from "@/lib/agents-data";
import {
  getLeadTemperatureForCall,
  type CallOutcome,
  type LeadTemperature,
} from "@/lib/call-detail-data";

export type CallDirection = "inbound" | "outbound" | "demo";

export type SentimentOutcome = "positive" | "neutral" | "negative";

export type CallStatus = "completed" | "missed" | "voicemail" | "failed";

export type CallLog = {
  id: string;
  timestamp: number;
  direction: CallDirection;
  phoneNumberId: string;
  phoneNumber: string;
  lineLabel: string;
  leadPhone: string;
  leadName: string;
  agentId: string;
  agentName: string;
  status: CallStatus;
  durationSeconds: number;
  outcome: CallOutcome | null;
  leadTemperature: LeadTemperature;
  leadScore: number;
  callCost: number;
  creditsUsed: number;
  provider: string;
  summarySnippet: string;
  hasRecording: boolean;
  recordingUrl: string | null;
  sentimentOutcome: SentimentOutcome | null;
  hasTranscript: boolean;
};

export type DateRangeOption =
  | "today"
  | "last-7-days"
  | "last-30-days"
  | "last-90-days"
  | "custom";

export type CallHistoryDateRange =
  | "today"
  | "last-7-days"
  | "last-30-days"
  | "custom";

export type DirectionFilter = "all" | CallDirection;

export type StatusFilter = "all" | CallStatus;

export type LeadTypeFilter = "all" | LeadTemperature;

export const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "last-90-days", label: "Last 90 Days" },
];

export const CALL_HISTORY_DATE_RANGE_OPTIONS: {
  value: CallHistoryDateRange;
  label: string;
}[] = [
  { value: "today", label: "Today" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

export const DIRECTION_OPTIONS: { value: DirectionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
  { value: "demo", label: "Demo" },
];

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "missed", label: "Missed" },
  { value: "voicemail", label: "Voicemail" },
  { value: "failed", label: "Failed" },
];

export const LEAD_TYPE_OPTIONS: { value: LeadTypeFilter; label: string }[] = [
  { value: "all", label: "All Lead Types" },
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
];

const LEAD_TEMPERATURE_ORDER: Record<LeadTemperature, number> = {
  hot: 0,
  warm: 1,
  cold: 2,
};

const LEAD_NAMES = [
  "Sarah Mitchell",
  "James Chen",
  "Priya Sharma",
  "Michael Torres",
  "Emily Watson",
  "David Okonkwo",
  "Lisa Park",
  "Robert Kim",
  "Amanda Foster",
  "Carlos Rivera",
  "Jennifer Liu",
  "Thomas Anderson",
  "Unknown Caller",
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

export const callLogs: CallLog[] = [];

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

export function formatCallStatus(status: CallStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDirection(direction: CallDirection): string {
  return direction.charAt(0).toUpperCase() + direction.slice(1);
}

export function formatSentimentOutcome(
  outcome: SentimentOutcome | null,
): string {
  if (!outcome) return "—";
  return outcome.charAt(0).toUpperCase() + outcome.slice(1);
}

export function extractSentimentOutcome(
  sentiment: Record<string, unknown> | null | undefined,
): SentimentOutcome | null {
  if (!sentiment) return null;

  const positive = Number(sentiment.positive ?? 0);
  const neutral = Number(sentiment.neutral ?? 0);
  const negative = Number(sentiment.negative ?? 0);
  const max = Math.max(positive, neutral, negative);

  if (max <= 0) return null;
  if (positive === max) return "positive";
  if (negative === max) return "negative";
  return "neutral";
}

export function truncateCallId(id: string, length = 8): string {
  if (id.length <= length) return id;
  return `${id.slice(0, length)}…`;
}

export function getDateRangeStart(option: DateRangeOption): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const offsets: Record<Exclude<DateRangeOption, "custom">, number> = {
    today: 0,
    "last-7-days": 7,
    "last-30-days": 30,
    "last-90-days": 90,
  };

  if (option === "custom") {
    return Date.now() - 30 * dayMs;
  }

  if (option === "today") {
    return now.getTime();
  }

  return Date.now() - offsets[option] * dayMs;
}

export function getCallHistoryRangeStart(
  option: CallHistoryDateRange,
  customFrom?: string,
): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (option === "custom") {
    if (customFrom) {
      const parsed = new Date(customFrom);
      parsed.setHours(0, 0, 0, 0);
      return parsed.getTime();
    }
    return Date.now() - 30 * dayMs;
  }

  if (option === "today") {
    return todayStart.getTime();
  }

  const offsets: Record<"last-7-days" | "last-30-days", number> = {
    "last-7-days": 7,
    "last-30-days": 30,
  };

  return Date.now() - offsets[option] * dayMs;
}

export function getCallHistoryRangeEnd(
  option: CallHistoryDateRange,
  customTo?: string,
): number {
  if (option === "custom" && customTo) {
    const parsed = new Date(customTo);
    parsed.setHours(23, 59, 59, 999);
    return parsed.getTime();
  }

  return Date.now();
}

export function sortCallLogsByLeadType(logs: CallLog[]): CallLog[] {
  return [...logs].sort((a, b) => {
    const orderDiff =
      LEAD_TEMPERATURE_ORDER[getLeadTemperatureForCall(a.id)] -
      LEAD_TEMPERATURE_ORDER[getLeadTemperatureForCall(b.id)];
    if (orderDiff !== 0) return orderDiff;
    return b.timestamp - a.timestamp;
  });
}

export function filterCallLogs(
  logs: CallLog[],
  dateRange: DateRangeOption,
  agentId: string,
  status: StatusFilter,
  leadType: LeadTypeFilter = "all",
): CallLog[] {
  const rangeStart = getDateRangeStart(dateRange);

  const filtered = logs.filter((log) => {
    if (log.timestamp < rangeStart) return false;
    if (agentId !== "all" && log.agentId !== agentId) return false;
    if (status !== "all" && log.status !== status) return false;
    if (
      leadType !== "all" &&
      getLeadTemperatureForCall(log.id) !== leadType
    ) {
      return false;
    }
    return true;
  });

  return sortCallLogsByLeadType(filtered);
}

export type PhoneNumberCallHistoryFilters = {
  direction: DirectionFilter;
  status: StatusFilter;
  dateRange: CallHistoryDateRange;
  customFrom: string;
  customTo: string;
  agentId: string;
};

export function filterCallsByPhoneNumber(
  logs: CallLog[],
  phoneNumberId: string,
  filters: PhoneNumberCallHistoryFilters,
): CallLog[] {
  const rangeStart = getCallHistoryRangeStart(
    filters.dateRange,
    filters.customFrom,
  );
  const rangeEnd = getCallHistoryRangeEnd(
    filters.dateRange,
    filters.customTo,
  );

  return logs
    .filter((log) => {
      if (log.phoneNumberId !== phoneNumberId) return false;
      if (log.timestamp < rangeStart || log.timestamp > rangeEnd) return false;
      if (filters.direction !== "all" && log.direction !== filters.direction) {
        return false;
      }
      if (filters.status !== "all" && log.status !== filters.status) {
        return false;
      }
      if (filters.agentId !== "all" && log.agentId !== filters.agentId) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getCallsForPhoneNumber(_phoneNumberId: string): CallLog[] {
  return [];
}

export function callLogsToCsv(logs: CallLog[]): string {
  const headers = [
    "Date",
    "Time",
    "Direction",
    "Lead Name",
    "Phone Number",
    "Line",
    "Lead Mobile",
    "Agent",
    "Duration",
    "Lead Type",
    "Outcome",
    "Cost",
    "Provider",
    "AI Summary",
    "Recording",
    "Status",
  ];

  const rows = logs.map((log) => [
    formatCallDate(log.timestamp),
    formatCallTime(log.timestamp),
    log.direction,
    log.leadName,
    log.phoneNumber,
    log.lineLabel,
    log.leadPhone,
    log.agentName,
    formatDuration(log.durationSeconds),
    log.leadTemperature,
    log.outcome ?? "",
    String(log.callCost),
    log.provider,
    log.summarySnippet,
    log.hasRecording ? "Yes" : "No",
    log.status,
  ]);

  return [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}
