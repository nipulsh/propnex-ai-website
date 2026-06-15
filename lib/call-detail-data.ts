import { callLogs, type CallLog } from "@/lib/call-logs-data";

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

const LEAD_NAMES = [
  "Sarah Mitchell",
  "James Chen",
  "Emily Rodriguez",
  "Michael O'Brien",
  "Priya Sharma",
  "David Kim",
  "Lisa Thompson",
  "Robert Garcia",
  "Amanda Foster",
  "Chris Williams",
];

const PROVIDERS = ["Twilio", "Vonage", "Plivo", "Telnyx"];

const LOCATIONS = [
  "Downtown Austin",
  "West Lake Hills",
  "Round Rock",
  "Cedar Park",
  "South Congress",
];

const PROPERTY_TYPES = [
  "Single-family home",
  "Townhouse",
  "Condo",
  "Multi-family",
  "Luxury estate",
];

const BUDGETS = [
  "$350,000 – $450,000",
  "$500,000 – $650,000",
  "$700,000 – $900,000",
  "$1M+",
];

const TIMELINES = [
  "Within 30 days",
  "1–3 months",
  "3–6 months",
  "6+ months",
];

const CONCERNS = [
  "School district quality",
  "Commute time",
  "HOA fees",
  "Property taxes",
  "Neighborhood safety",
  "Resale value",
];

const REQUIREMENTS = [
  "Home office space",
  "Pet-friendly",
  "EV charging",
  "Pool access",
  "Smart home ready",
];

const AGENT_LINES = [
  "Thank you for calling PropNex. How can I assist you today?",
  "I'd be happy to help you explore properties in that area.",
  "Based on your preferences, I have a few options that might interest you.",
  "Would you like to schedule a site visit this week?",
  "Let me check availability for a callback at your preferred time.",
  "I can send you a detailed brochure with floor plans and pricing.",
];

const LEAD_LINES = [
  "I'm looking for a property in the Austin area.",
  "My budget is around six hundred thousand.",
  "We need at least three bedrooms and a good school district.",
  "Can we schedule a visit for this weekend?",
  "What are the HOA fees typically in that neighborhood?",
  "I'd like someone to call me back tomorrow afternoon.",
  "We're hoping to move within the next two months.",
];

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

function pickRating(rand: () => number): QualityRating {
  const r = rand();
  if (r < 0.35) return "excellent";
  if (r < 0.65) return "good";
  if (r < 0.85) return "fair";
  return "poor";
}

function scoreToTemperature(score: number): LeadTemperature {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

function generateTranscript(
  callId: string,
  durationSeconds: number,
  rand: () => number,
): CallDetail["transcript"] {
  const turns = Math.min(12, Math.max(4, Math.floor(durationSeconds / 45)));
  const entries: CallDetail["transcript"] = [];
  let elapsed = 0;

  for (let i = 0; i < turns; i++) {
    const speaker: TranscriptSpeaker = i % 2 === 0 ? "agent" : "lead";
    const gap = Math.floor(rand() * 25) + 8;
    elapsed = Math.min(elapsed + gap, durationSeconds - 5);
    entries.push({
      id: `${callId}-t${i}`,
      speaker,
      timestamp: elapsed,
      text:
        speaker === "agent" ? pick(rand, AGENT_LINES) : pick(rand, LEAD_LINES),
    });
  }

  return entries;
}

function generateSentimentTrend(rand: () => number): CallDetail["sentiment"]["trend"] {
  const points: CallDetail["sentiment"]["trend"] = [];
  let score = rand() * 0.4 - 0.2;
  for (let p = 0; p <= 100; p += 10) {
    score += (rand() - 0.45) * 0.3;
    score = Math.max(-1, Math.min(1, score));
    points.push({ atPercent: p, score });
  }
  return points;
}

function generateLeadHistory(
  callId: string,
  baseLog: CallLog,
  rand: () => number,
): CallDetail["leadHistory"] {
  const count = Math.floor(rand() * 4);
  if (count === 0) return [];

  const dayMs = 24 * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = (i + 1) * (Math.floor(rand() * 30) + 14);
    return {
      id: `${callId}-hist-${i}`,
      date: baseLog.timestamp - daysAgo * dayMs,
      outcome: pick(rand, OUTCOME_OPTIONS).value,
      agentName: baseLog.agentName,
      durationSeconds: Math.floor(rand() * 400) + 60,
    };
  }).sort((a, b) => b.date - a.date);
}

function generateCallDetail(baseLog: CallLog): CallDetail {
  const seed = hashSeed(baseLog.id);
  const rand = seededRandom(seed);

  const leadScore = Math.floor(rand() * 60) + 25;
  const leadTemperature = scoreToTemperature(leadScore);
  const recordingStatus: RecordingStatus =
    baseLog.status === "completed"
      ? rand() > 0.1
        ? "available"
        : "processing"
      : "unavailable";

  const positive = Math.floor(rand() * 40) + 30;
  const negative = Math.floor(rand() * 20) + 5;
  const neutral = 100 - positive - negative;

  const customerTalk = Math.floor(baseLog.durationSeconds * (0.35 + rand() * 0.2));
  const agentTalk = baseLog.durationSeconds - customerTalk - Math.floor(rand() * 30);

  const lagEventCount = Math.floor(rand() * 3);
  const lagEvents = Array.from({ length: lagEventCount }, (_, i) => ({
    atSeconds: Math.floor(rand() * baseLog.durationSeconds),
    durationMs: Math.floor(rand() * 800) + 200,
  }));

  const recommendations = [
    { id: "rec-1", label: "Call back within 24 hours", priority: "high" as const },
    { id: "rec-2", label: "Send property brochure", priority: "medium" as const },
    { id: "rec-3", label: "Schedule property visit", priority: "high" as const },
    { id: "rec-4", label: "Escalate to sales agent", priority: "medium" as const },
    { id: "rec-5", label: "Add to nurture campaign", priority: "low" as const },
  ].slice(0, Math.floor(rand() * 3) + 2);

  const noteCount = Math.floor(rand() * 3);
  const internalNotes = Array.from({ length: noteCount }, (_, i) => {
    const createdAt = baseLog.timestamp - (i + 1) * 3600000;
    return {
      id: `${baseLog.id}-note-${i}`,
      author: ["Alex Rivera", "Jordan Lee", "Sam Patel"][i % 3]!,
      content: [
        "Lead showed strong interest in downtown properties.",
        "Requested callback after reviewing brochure.",
        "Prefers morning calls only.",
      ][i % 3]!,
      createdAt,
      updatedAt: createdAt,
    };
  });

  return {
    ...baseLog,
    leadName: baseLog.leadName || pick(rand, LEAD_NAMES),
    callCost: Math.round((baseLog.durationSeconds / 60) * (0.015 + rand() * 0.01) * 100) / 100,
    provider: pick(rand, PROVIDERS),
    outcome: pick(rand, OUTCOME_OPTIONS).value,
    leadScore,
    leadTemperature,
    conversionProbability: Math.min(95, leadScore + Math.floor(rand() * 15)),
    interestLevel: leadScore >= 70 ? "high" : leadScore >= 45 ? "medium" : "low",
    recording: {
      url:
        recordingStatus === "available"
          ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          : "",
      lengthSeconds: baseLog.durationSeconds,
      status: recordingStatus,
    },
    aiSummary: {
      interests: `Interested in ${pick(rand, PROPERTY_TYPES).toLowerCase()} in ${pick(rand, LOCATIONS)}.`,
      discussionPoints: [
        "Budget range and financing preferences",
        "Desired neighborhood and school districts",
        "Timeline for purchase and move-in",
        "Property features and must-haves",
      ],
      decisions: [
        leadTemperature === "hot"
          ? "Agreed to schedule a site visit"
          : "Requested follow-up call with more options",
        "Confirmed preferred contact method",
      ],
      nextSteps: [
        "Send curated property listings via email",
        "Schedule site visit within 48 hours",
        "Prepare financing pre-approval guidance",
      ],
    },
    transcript: generateTranscript(baseLog.id, baseLog.durationSeconds, rand),
    engagement: {
      customerTalkSeconds: customerTalk,
      agentTalkSeconds: Math.max(30, agentTalk),
      engagementScore: Math.floor(rand() * 30) + 55,
      silenceSeconds: Math.floor(rand() * 45) + 5,
      interruptions: Math.floor(rand() * 6),
    },
    callQuality: {
      connection: pickRating(rand),
      lagScore: Math.floor(rand() * 40) + 5,
      networkStability: pickRating(rand),
      audioQuality: pickRating(rand),
      lagEvents,
    },
    sentiment: {
      positive,
      neutral,
      negative,
      trend: generateSentimentTrend(rand),
    },
    keyInsights: {
      budget: pick(rand, BUDGETS),
      preferredLocation: pick(rand, LOCATIONS),
      propertyType: pick(rand, PROPERTY_TYPES),
      timeline: pick(rand, TIMELINES),
      mainConcerns: CONCERNS.slice(0, Math.floor(rand() * 3) + 1),
      specialRequirements: REQUIREMENTS.slice(0, Math.floor(rand() * 2) + 1),
    },
    followUpRecommendations: recommendations,
    reactivation: {
      enabled: false,
      campaignId: undefined,
      timeline: undefined,
      notes: undefined,
    },
    internalNotes,
    leadHistory: generateLeadHistory(baseLog.id, baseLog, rand),
  };
}

const detailCache = new Map<string, CallDetail>();

export function getCallDetail(callId: string): CallDetail | null {
  const baseLog = callLogs.find((c) => c.id === callId);
  if (!baseLog) return null;

  if (!detailCache.has(callId)) {
    detailCache.set(callId, generateCallDetail(baseLog));
  }

  return detailCache.get(callId)!;
}

export function getLeadTemperatureForCall(callId: string): LeadTemperature {
  const seed = hashSeed(callId);
  const rand = seededRandom(seed);
  const leadScore = Math.floor(rand() * 60) + 25;
  return scoreToTemperature(leadScore);
}

export function formatTranscriptTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatCallCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}
