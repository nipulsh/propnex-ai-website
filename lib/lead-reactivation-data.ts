import { agents } from "@/lib/agents-data";

export type LeadStatus =
  | "dormant"
  | "scheduled"
  | "contacted"
  | "reactivated"
  | "no-response";

export type InactivityFilter = "all" | "30-plus" | "60-plus" | "90-plus";

export type StatusFilter = "all" | LeadStatus;

export type DormantLead = {
  id: string;
  contactName: string;
  phoneNumber: string;
  lastContactAt: number;
  daysInactive: number;
  agentId: string;
  agentName: string;
  status: LeadStatus;
  source: string;
};

export const LEAD_STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "dormant", label: "Dormant" },
  { value: "scheduled", label: "Scheduled" },
  { value: "contacted", label: "Contacted" },
  { value: "reactivated", label: "Reactivated" },
  { value: "no-response", label: "No Response" },
];

export const INACTIVITY_OPTIONS: { value: InactivityFilter; label: string }[] = [
  { value: "all", label: "Any Inactivity" },
  { value: "30-plus", label: "30+ Days" },
  { value: "60-plus", label: "60+ Days" },
  { value: "90-plus", label: "90+ Days" },
];

const CONTACT_NAMES = [
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

const PHONE_NUMBERS = [
  "+1 (555) 234-5678",
  "+1 (555) 345-6789",
  "+1 (555) 456-7890",
  "+1 (555) 567-8901",
  "+1 (555) 678-9012",
  "+1 (555) 789-0123",
  "+1 (555) 890-1234",
  "+1 (555) 901-2345",
];

const SOURCES = [
  "Website Form",
  "Trade Show",
  "Referral",
  "Cold Outreach",
  "LinkedIn",
  "Partner Lead",
];

const STATUSES: LeadStatus[] = [
  "dormant",
  "scheduled",
  "contacted",
  "reactivated",
  "no-response",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function generateDormantLeads(count: number): DormantLead[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, index) => {
    const agent = randomItem(agents);
    const daysInactive = Math.floor(Math.random() * 120) + 15;
    const lastContactAt = now - daysInactive * dayMs - index * 41_000;

    return {
      id: `lead-${index + 1}`,
      contactName: randomItem(CONTACT_NAMES),
      phoneNumber: randomItem(PHONE_NUMBERS),
      lastContactAt,
      daysInactive,
      agentId: agent.id,
      agentName: agent.name,
      status: randomItem(STATUSES),
      source: randomItem(SOURCES),
    };
  }).sort((a, b) => b.daysInactive - a.daysInactive);
}

export const dormantLeads = generateDormantLeads(186);

export const LEAD_REACTIVATION_STATS = {
  dormantLeads: 186,
  reactivationRate: "24%",
  scheduledCalls: 42,
  dormantTrend: "+12 this week",
  rateTrend: "+3.2% vs last month",
  scheduledContext: "Next 7 days",
};

export function formatLastContact(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function matchesInactivity(
  daysInactive: number,
  filter: InactivityFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "30-plus") return daysInactive >= 30;
  if (filter === "60-plus") return daysInactive >= 60;
  return daysInactive >= 90;
}

export function filterDormantLeads(
  leads: DormantLead[],
  status: StatusFilter,
  agentId: string,
  inactivity: InactivityFilter,
): DormantLead[] {
  return leads.filter((lead) => {
    if (status !== "all" && lead.status !== status) return false;
    if (agentId !== "all" && lead.agentId !== agentId) return false;
    if (!matchesInactivity(lead.daysInactive, inactivity)) return false;
    return true;
  });
}
