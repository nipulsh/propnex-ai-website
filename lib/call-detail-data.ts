import type { CallLog } from "@/lib/call-logs-data";

export type LeadTemperature = "hot" | "warm" | "cold";
export type CallOutcome =
  | "interested"
  | "callback-requested"
  | "site-visit-scheduled"
  | "not-interested"
  | "no-answer"
  | "wrong-number"
  | "converted";
export type QualityRating = "excellent" | "good" | "fair" | "poor";
export type TranscriptSpeaker = "agent" | "lead";
export type InterestLevel = "high" | "medium" | "low";
export type RecordingStatus = "available" | "processing" | "unavailable";
export type RecommendationPriority = "high" | "medium" | "low";

export type CallDetail = CallLog & {
  leadName: string;
  callCost: number;
  creditsUsed: number;
  provider: string;
  outcome: CallOutcome;
  leadScore: number;
  leadTemperature: LeadTemperature;
  conversionProbability: number;
  interestLevel: InterestLevel;
  recording: {
    url: string;
    lengthSeconds: number;
    status: RecordingStatus;
  };
  aiSummary: {
    interests: string;
    discussionPoints: string[];
    decisions: string[];
    nextSteps: string[];
  };
  transcript: {
    id: string;
    speaker: TranscriptSpeaker;
    timestamp: number;
    text: string;
  }[];
  engagement: {
    customerTalkSeconds: number;
    agentTalkSeconds: number;
    engagementScore: number;
    silenceSeconds: number;
    interruptions: number;
  };
  callQuality: {
    connection: QualityRating;
    lagScore: number;
    networkStability: QualityRating;
    audioQuality: QualityRating;
    lagEvents: { atSeconds: number; durationMs: number }[];
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    trend: { atPercent: number; score: number }[];
  };
  keyInsights: {
    budget?: string;
    preferredLocation?: string;
    propertyType?: string;
    timeline?: string;
    mainConcerns: string[];
    specialRequirements: string[];
  };
  followUpRecommendations: {
    id: string;
    label: string;
    priority: RecommendationPriority;
  }[];
  reactivation: {
    enabled: boolean;
    campaignId?: string;
    timeline?: string;
    notes?: string;
  };
  internalNotes: {
    id: string;
    author: string;
    content: string;
    createdAt: number;
    updatedAt: number;
  }[];
  leadHistory: {
    id: string;
    date: number;
    outcome: CallOutcome;
    agentName: string;
    durationSeconds: number;
  }[];
};

export const OUTCOME_OPTIONS: { value: CallOutcome; label: string }[] = [
  { value: "interested", label: "Interested" },
  { value: "callback-requested", label: "Callback Requested" },
  { value: "site-visit-scheduled", label: "Site Visit Scheduled" },
  { value: "not-interested", label: "Not Interested" },
  { value: "no-answer", label: "No Answer" },
  { value: "wrong-number", label: "Wrong Number" },
  { value: "converted", label: "Converted" },
];

export const QUALITY_LABELS: Record<QualityRating, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export const LEAD_TEMPERATURE_STYLES: Record<
  LeadTemperature,
  { label: string; className: string }
> = {
  hot: { label: "Hot", className: "text-destructive bg-destructive/10" },
  warm: { label: "Warm", className: "text-orange-400 bg-orange-400/10" },
  cold: { label: "Cold", className: "text-cyan-400 bg-cyan-400/10" },
};

export const QUALITY_STYLES: Record<QualityRating, string> = {
  excellent: "text-success bg-success/10",
  good: "text-propnex-accent bg-propnex-accent/10",
  fair: "text-orange-400 bg-orange-400/10",
  poor: "text-destructive bg-destructive/10",
};

export const REACTIVATION_CAMPAIGNS = [
  { id: "camp-1", label: "Q2 Dormant Lead Revival" },
  { id: "camp-2", label: "High-Value Buyer Nurture" },
  { id: "camp-3", label: "Post-Visit Follow-Up" },
  { id: "camp-4", label: "Seasonal Property Push" },
];

export function getReactivationCampaigns() {
  return REACTIVATION_CAMPAIGNS;
}

export function formatOutcome(outcome: CallOutcome): string {
  return OUTCOME_OPTIONS.find((o) => o.value === outcome)?.label ?? outcome;
}
export function getCallDetail(_callId: string): CallDetail | null {
  return null;
}

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i);
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function scoreToTemperature(score: number): LeadTemperature {
  if (score >= 70) return "hot";
  if (score >= 45) return "warm";
  return "cold";
}

export function getLeadTemperatureForCall(callId: string): LeadTemperature {
  const rand = seededRandom(hashSeed(callId));
  return scoreToTemperature(Math.floor(rand() * 60) + 25);
}

export function formatTranscriptTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatCallCost(cost: number): string {
  return `₹${cost.toFixed(2)}`;
}