export type AgentCardData = {
  id: string;
  name: string;
  role: string;
  languages: string[];
  status: "active" | "disabled";
  voiceProfile: string;
  enabled: boolean;
  avatarGradient: string;
};

export const AGENT_CATEGORIES = [
  "Customer Experience",
  "Technical Support",
  "Outbound Lead Gen",
  "Appointment Scheduling",
  "Sales",
  "Lead Qualification",
] as const;

export const ACCENT_OPTIONS = [
  "North American",
  "British",
  "Australian",
  "European",
  "Latin American",
] as const;

export const agents: AgentCardData[] = [
  {
    id: "elysian-primary",
    name: "Elysian Primary",
    role: "Customer Experience",
    languages: ["English (US)"],
    status: "active",
    voiceProfile: "Professional Male",
    enabled: true,
    avatarGradient:
      "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
  },
  {
    id: "nexus-global",
    name: "Nexus Global",
    role: "Technical Support",
    languages: ["Spanish (MX)", "English (UK)"],
    status: "active",
    voiceProfile: "Soft Female",
    enabled: true,
    avatarGradient:
      "bg-gradient-to-br from-blue-500/40 via-teal-500/30 to-emerald-500/20",
  },
  {
    id: "vortex-sales",
    name: "Vortex Sales",
    role: "Outbound Lead Gen",
    languages: ["English (US)"],
    status: "disabled",
    voiceProfile: "Confident Neutral",
    enabled: false,
    avatarGradient:
      "bg-gradient-to-br from-orange-500/40 via-rose-500/30 to-red-500/20",
  },
  {
    id: "aria-concierge",
    name: "Aria Concierge",
    role: "Appointment Scheduling",
    languages: ["French (FR)"],
    status: "active",
    voiceProfile: "Eloquent Female",
    enabled: true,
    avatarGradient:
      "bg-gradient-to-br from-fuchsia-500/40 via-purple-500/30 to-pink-500/20",
  },
];
