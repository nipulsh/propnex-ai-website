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


export const dormantLeads: DormantLead[] = [];

export const LEAD_REACTIVATION_STATS = {
  dormantLeads: 0,
  reactivationRate: "0%",
  scheduledCalls: 0,
  dormantTrend: "No data yet",
  rateTrend: "No data yet",
  scheduledContext: "No scheduled calls",
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
