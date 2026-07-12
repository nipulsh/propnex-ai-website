import type {
  CallDetail,
  CallOutcome,
  InterestLevel,
  LeadTemperature,
  QualityRating,
  RecordingStatus,
  TranscriptSpeaker,
} from "@/lib/call-detail-data";
import { extractSentimentOutcome } from "@/lib/call-logs-data";

type GraphQLCallDetail = {
  id: string;
  direction: string;
  status: string;
  outcome?: string | null;
  startedAt: string;
  durationSeconds: number;
  recordingUrl?: string | null;
  cost?: number | null;
  creditsUsed?: number | null;
  provider?: string | null;
  aiSummary?: Record<string, unknown> | null;
  sentiment?: Record<string, unknown> | null;
  engagement?: Record<string, unknown> | null;
  lead?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    temperature?: string | null;
    score?: number;
  } | null;
  aiAgent?: { id: string; name: string } | null;
  phoneNumber?: { id: string; number: string; label?: string | null } | null;
  transcript?: {
    id: string;
    fullText?: string | null;
    segments?: unknown;
  } | null;
};

function toOutcome(value?: string | null): CallOutcome {
  if (!value) return "no-answer";
  return value.toLowerCase().replace(/_/g, "-") as CallOutcome;
}

function toTemperature(value?: string | null): LeadTemperature {
  if (!value) return "cold";
  return value.toLowerCase() as LeadTemperature;
}

function parseTranscriptSegments(
  segments: unknown,
): CallDetail["transcript"] {
  if (!Array.isArray(segments)) return [];
  return segments.map((seg, index) => {
    const item = seg as Record<string, unknown>;
    return {
      id: String(item.id ?? `seg-${index}`),
      speaker: (item.speaker === "AGENT" ? "agent" : "lead") as TranscriptSpeaker,
      timestamp: Number(item.timestamp ?? item.atSeconds ?? 0),
      text: String(item.text ?? ""),
    };
  });
}

export function mapGraphQLCallDetailToUI(detail: GraphQLCallDetail): CallDetail {
  const leadName =
    [detail.lead?.firstName, detail.lead?.lastName].filter(Boolean).join(" ") ||
    "Unknown";
  const summary = (detail.aiSummary ?? {}) as Record<string, unknown>;
  const sentiment = (detail.sentiment ?? {}) as Record<string, unknown>;
  const engagement = (detail.engagement ?? {}) as Record<string, unknown>;
  const recordingStatus: RecordingStatus = detail.recordingUrl
    ? "available"
    : "unavailable";

  return {
    id: detail.id,
    timestamp: new Date(detail.startedAt).getTime(),
    direction: detail.direction.toLowerCase() as CallDetail["direction"],
    phoneNumberId: detail.phoneNumber?.id ?? "",
    phoneNumber: detail.phoneNumber?.number ?? "",
    lineLabel: detail.phoneNumber?.label ?? "",
    leadPhone: detail.lead?.phone ?? "—",
    leadName,
    agentId: detail.aiAgent?.id ?? "",
    agentName: detail.aiAgent?.name ?? "Unassigned",
    status: detail.status.toLowerCase() as CallDetail["status"],
    durationSeconds: detail.durationSeconds,
    summarySnippet: String(summary.interests ?? ""),
    hasRecording: recordingStatus === "available",
    recordingUrl: detail.recordingUrl ?? null,
    sentimentOutcome: extractSentimentOutcome(detail.sentiment),
    hasTranscript: Boolean(detail.transcript),
    callCost: detail.cost ?? 0,
    creditsUsed: detail.creditsUsed ?? 0,
    provider: detail.provider ?? "PropNex",
    outcome: toOutcome(detail.outcome),
    leadScore: detail.lead?.score ?? 0,
    leadTemperature: toTemperature(detail.lead?.temperature),
    conversionProbability: Math.min(100, (detail.lead?.score ?? 0)),
    interestLevel: "medium" as InterestLevel,
    recording: {
      url: detail.recordingUrl ?? "",
      lengthSeconds: detail.durationSeconds,
      status: recordingStatus,
    },
    aiSummary: {
      interests: String(summary.interests ?? ""),
      discussionPoints: Array.isArray(summary.discussionPoints)
        ? (summary.discussionPoints as string[])
        : [],
      decisions: Array.isArray(summary.decisions)
        ? (summary.decisions as string[])
        : [],
      nextSteps: Array.isArray(summary.nextSteps)
        ? (summary.nextSteps as string[])
        : [],
    },
    transcript: parseTranscriptSegments(detail.transcript?.segments),
    engagement: {
      customerTalkSeconds: Number(engagement.customerTalkSeconds ?? 0),
      agentTalkSeconds: Number(engagement.agentTalkSeconds ?? 0),
      engagementScore: Number(engagement.engagementScore ?? 0),
      silenceSeconds: Number(engagement.silenceSeconds ?? 0),
      interruptions: Number(engagement.interruptions ?? 0),
    },
    callQuality: {
      connection: "good" as QualityRating,
      lagScore: 0,
      networkStability: "good" as QualityRating,
      audioQuality: "good" as QualityRating,
      lagEvents: [],
    },
    sentiment: {
      positive: Number(sentiment.positive ?? 0),
      neutral: Number(sentiment.neutral ?? 0),
      negative: Number(sentiment.negative ?? 0),
      trend: Array.isArray(sentiment.trend)
        ? (sentiment.trend as CallDetail["sentiment"]["trend"])
        : [],
    },
    keyInsights: {
      mainConcerns: [],
      specialRequirements: [],
    },
    followUpRecommendations: [],
    reactivation: { enabled: false },
    internalNotes: [],
    leadHistory: [],
  };
}
