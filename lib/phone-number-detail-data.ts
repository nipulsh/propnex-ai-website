import type { CallOutcome } from "@/lib/call-detail-data";
import { getCallDetail } from "@/lib/call-detail-data";
import {
  callLogs,
  filterCallsByPhoneNumber,
  formatDuration,
  type PhoneNumberCallHistoryFilters,
} from "@/lib/call-logs-data";
import {
  getPhoneNumberById,
  initialPhoneNumbers,
  type PhoneNumber,
} from "@/lib/phone-numbers-data";

export type PhoneNumberOverviewMetrics = {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  missedCalls: number;
  averageDurationSeconds: number;
  totalTalkTimeSeconds: number;
};

export type PhoneNumberAnalytics = {
  inboundCallsToday: number;
  outboundCallsToday: number;
  weeklyActivity: number;
  monthlyActivity: number;
  conversionRate: number;
  hotLeadsGenerated: number;
  dailyTrend: { label: string; inbound: number; outbound: number }[];
};

export { getPhoneNumberById };

export function getPhoneNumberMetrics(
  phoneNumberId: string,
): PhoneNumberOverviewMetrics {
  const calls = callLogs.filter((log) => log.phoneNumberId === phoneNumberId);
  const inbound = calls.filter((c) => c.direction === "inbound");
  const outbound = calls.filter((c) => c.direction === "outbound");
  const missed = calls.filter((c) => c.status === "missed");
  const completed = calls.filter((c) => c.status === "completed");
  const totalDuration = completed.reduce((sum, c) => sum + c.durationSeconds, 0);

  return {
    totalCalls: calls.length,
    inboundCalls: inbound.length,
    outboundCalls: outbound.length,
    missedCalls: missed.length,
    averageDurationSeconds:
      completed.length > 0 ? Math.round(totalDuration / completed.length) : 0,
    totalTalkTimeSeconds: totalDuration,
  };
}

export function getPhoneNumberAnalytics(
  phoneNumberId: string,
): PhoneNumberAnalytics {
  const calls = callLogs.filter((log) => log.phoneNumberId === phoneNumberId);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCalls = calls.filter((c) => c.timestamp >= todayStart.getTime());
  const weekCalls = calls.filter((c) => c.timestamp >= now - 7 * dayMs);
  const monthCalls = calls.filter((c) => c.timestamp >= now - 30 * dayMs);

  const outboundCompleted = calls.filter(
    (c) => c.direction === "outbound" && c.status === "completed",
  );
  const converted = outboundCompleted.filter((c) => {
    const detail = getCallDetail(c.id);
    return (
      detail &&
      (detail.outcome === "converted" ||
        detail.outcome === "site-visit-scheduled" ||
        detail.outcome === "interested")
    );
  });

  const hotLeads = calls.filter((c) => {
    const detail = getCallDetail(c.id);
    return detail?.leadTemperature === "hot";
  }).length;

  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * dayMs;
    const dayEnd = dayStart + dayMs;
    const dayCalls = calls.filter(
      (c) => c.timestamp >= dayStart && c.timestamp < dayEnd,
    );
    const date = new Date(dayStart);
    const label = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date);

    return {
      label,
      inbound: dayCalls.filter((c) => c.direction === "inbound").length,
      outbound: dayCalls.filter((c) => c.direction === "outbound").length,
    };
  });

  return {
    inboundCallsToday: todayCalls.filter((c) => c.direction === "inbound")
      .length,
    outboundCallsToday: todayCalls.filter((c) => c.direction === "outbound")
      .length,
    weeklyActivity: weekCalls.length,
    monthlyActivity: monthCalls.length,
    conversionRate:
      outboundCompleted.length > 0
        ? Math.round((converted.length / outboundCompleted.length) * 100)
        : 0,
    hotLeadsGenerated: hotLeads,
    dailyTrend,
  };
}

export function getCallsForPhoneNumberFiltered(
  phoneNumberId: string,
  filters: PhoneNumberCallHistoryFilters,
) {
  return filterCallsByPhoneNumber(callLogs, phoneNumberId, filters);
}

export function getCallOutcome(callId: string): string {
  const detail = getCallDetail(callId);
  if (!detail) return "—";

  const labels: Record<CallOutcome, string> = {
    interested: "Interested",
    "callback-requested": "Callback Requested",
    "site-visit-scheduled": "Site Visit Scheduled",
    "not-interested": "Not Interested",
    "no-answer": "No Answer",
    "wrong-number": "Wrong Number",
    converted: "Converted",
  };

  return labels[detail.outcome] ?? detail.outcome;
}

export function formatTalkTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return formatDuration(seconds);
}

export function findPhoneNumberInStore(
  numbers: PhoneNumber[],
  id: string,
): PhoneNumber | undefined {
  return numbers.find((entry) => entry.id === id);
}

export { initialPhoneNumbers };
