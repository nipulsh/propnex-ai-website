import type { Agent, AgentEnvironment, AgentType } from "@/lib/agents-data";
import { AGENT_CATEGORIES } from "@/lib/agents-data";

export type AgentLibraryTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  useCases: string[];
  estimatedSetupMinutes: number;
  defaultType: AgentType;
  samplePrompt: string;
  defaultFirstMessage: string;
  defaultVariables: { key: string; label: string; placeholder: string }[];
  compatibleVoices: { id: string; name: string; provider: string }[];
};

export const agentLibraryTemplates: AgentLibraryTemplate[] = [
  {
    id: "customer-support",
    name: "Customer Support Agent",
    category: "Customer Experience",
    description:
      "Handle inbound support calls with empathy, troubleshoot issues, and route escalations when needed.",
    useCases: [
      "Order status inquiries",
      "Billing questions",
      "Technical troubleshooting",
      "Account management",
    ],
    estimatedSetupMinutes: 5,
    defaultType: "inbound",
    samplePrompt:
      "You are a customer support specialist. Listen carefully, acknowledge concerns, and provide clear solutions.",
    defaultFirstMessage:
      "Thank you for calling. My name is Alex, and I'm here to help you today.",
    defaultVariables: [
      { key: "companyName", label: "Company Name", placeholder: "PropNex AI" },
      { key: "supportHours", label: "Support Hours", placeholder: "9 AM - 6 PM EST" },
    ],
    compatibleVoices: [
      { id: "v-prof-f", name: "Professional Female", provider: "ElevenLabs" },
      { id: "v-calm-m", name: "Calm Male", provider: "ElevenLabs" },
      { id: "v-warm-f", name: "Warm Female", provider: "PlayHT" },
    ],
  },
  {
    id: "appointment-booking",
    name: "Appointment Booking Agent",
    category: "Appointment Scheduling",
    description:
      "Schedule, reschedule, and confirm appointments with calendar integration support.",
    useCases: [
      "New appointment booking",
      "Rescheduling requests",
      "Appointment reminders",
      "Availability checks",
    ],
    estimatedSetupMinutes: 4,
    defaultType: "inbound",
    samplePrompt:
      "You are an appointment scheduling assistant. Confirm availability, collect details, and book appointments efficiently.",
    defaultFirstMessage:
      "Hi! I can help you schedule an appointment. What day works best for you?",
    defaultVariables: [
      { key: "businessName", label: "Business Name", placeholder: "PropNex Realty" },
      { key: "timezone", label: "Timezone", placeholder: "America/New_York" },
    ],
    compatibleVoices: [
      { id: "v-friendly-f", name: "Friendly Female", provider: "ElevenLabs" },
      { id: "v-clear-m", name: "Clear Male", provider: "PlayHT" },
    ],
  },
  {
    id: "real-estate-lead-qual",
    name: "Real Estate Lead Qualification Agent",
    category: "Lead Qualification",
    description:
      "Qualify property leads by gathering budget, timeline, property preferences, and intent signals.",
    useCases: [
      "Buyer qualification",
      "Seller intake",
      "Property interest scoring",
      "Budget discovery",
    ],
    estimatedSetupMinutes: 6,
    defaultType: "outbound",
    samplePrompt:
      "You are a real estate lead qualification specialist. Ask targeted questions to assess buyer/seller readiness.",
    defaultFirstMessage:
      "Hello! I'm calling from PropNex regarding your property inquiry. Do you have a moment?",
    defaultVariables: [
      { key: "agencyName", label: "Agency Name", placeholder: "PropNex Realty" },
      { key: "marketArea", label: "Market Area", placeholder: "Greater Metro Area" },
    ],
    compatibleVoices: [
      { id: "v-assert-m", name: "Assertive Male", provider: "ElevenLabs" },
      { id: "v-prof-f", name: "Professional Female", provider: "ElevenLabs" },
    ],
  },
  {
    id: "follow-up",
    name: "Follow-Up Agent",
    category: "Follow-Up",
    description:
      "Re-engage leads with personalized follow-up calls based on prior interactions and interest level.",
    useCases: [
      "Post-meeting follow-ups",
      "Proposal check-ins",
      "Nurture sequences",
      "Interest confirmation",
    ],
    estimatedSetupMinutes: 4,
    defaultType: "outbound",
    samplePrompt:
      "You are a follow-up specialist. Reference prior conversations and guide leads toward next steps.",
    defaultFirstMessage:
      "Hi, this is a follow-up call regarding our previous conversation. Is now a good time?",
    defaultVariables: [
      { key: "agentName", label: "Agent Display Name", placeholder: "Sarah" },
      { key: "callbackWindow", label: "Callback Window", placeholder: "within 48 hours" },
    ],
    compatibleVoices: [
      { id: "v-warm-f", name: "Warm Female", provider: "PlayHT" },
      { id: "v-gentle-m", name: "Gentle Male", provider: "PlayHT" },
    ],
  },
  {
    id: "lead-reactivation",
    name: "Lead Reactivation Agent",
    category: "Outbound Lead Gen",
    description:
      "Re-engage dormant leads with targeted outreach to revive interest and book appointments.",
    useCases: [
      "Dormant lead outreach",
      "Win-back campaigns",
      "Seasonal re-engagement",
      "List reactivation",
    ],
    estimatedSetupMinutes: 5,
    defaultType: "outbound",
    samplePrompt:
      "You are reactivating dormant leads. Be respectful, reference past interest, and offer value.",
    defaultFirstMessage:
      "Hello! We noticed you were interested in our services previously. I'd love to share what's new.",
    defaultVariables: [
      { key: "offerSummary", label: "Current Offer", placeholder: "Free property valuation" },
      { key: "companyName", label: "Company Name", placeholder: "PropNex AI" },
    ],
    compatibleVoices: [
      { id: "v-energy-n", name: "Energetic Neutral", provider: "ElevenLabs" },
      { id: "v-persu-m", name: "Persuasive Male", provider: "PlayHT" },
    ],
  },
  {
    id: "faq",
    name: "FAQ Agent",
    category: "FAQ",
    description:
      "Answer frequently asked questions using your knowledge base with fast, accurate responses.",
    useCases: [
      "Product FAQs",
      "Policy questions",
      "Hours and location",
      "General information",
    ],
    estimatedSetupMinutes: 3,
    defaultType: "inbound",
    samplePrompt:
      "You are an FAQ specialist. Provide concise, accurate answers from the knowledge base.",
    defaultFirstMessage:
      "Hello! I can answer questions about our products and services. What would you like to know?",
    defaultVariables: [
      { key: "knowledgeBase", label: "Knowledge Base Name", placeholder: "Company FAQ" },
    ],
    compatibleVoices: [
      { id: "v-clear-f", name: "Clear Female", provider: "ElevenLabs" },
      { id: "v-neutral", name: "Neutral Voice", provider: "ElevenLabs" },
    ],
  },
  {
    id: "sales",
    name: "Sales Agent",
    category: "Sales",
    description:
      "Drive sales conversations with persuasive scripting, objection handling, and closing techniques.",
    useCases: [
      "Outbound sales calls",
      "Upsell campaigns",
      "Demo scheduling",
      "Objection handling",
    ],
    estimatedSetupMinutes: 7,
    defaultType: "hybrid",
    samplePrompt:
      "You are a sales professional. Build rapport, identify needs, handle objections, and guide toward conversion.",
    defaultFirstMessage:
      "Hi there! I'm reaching out because I think we have something that could really help you.",
    defaultVariables: [
      { key: "productName", label: "Product Name", placeholder: "PropNex AI Platform" },
      { key: "promoOffer", label: "Promotional Offer", placeholder: "20% off first month" },
    ],
    compatibleVoices: [
      { id: "v-persu-m", name: "Persuasive Male", provider: "PlayHT" },
      { id: "v-conf-n", name: "Confident Neutral", provider: "ElevenLabs" },
    ],
  },
];

export function findLibraryTemplate(
  templateId: string,
): AgentLibraryTemplate | undefined {
  return agentLibraryTemplates.find((t) => t.id === templateId);
}

export function filterLibraryTemplates(
  templates: AgentLibraryTemplate[],
  searchQuery: string,
  categoryFilter: string,
): AgentLibraryTemplate[] {
  const query = searchQuery.trim().toLowerCase();
  return templates.filter((t) => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (!query) return true;
    return (
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.useCases.some((u) => u.toLowerCase().includes(query))
    );
  });
}

export const LIBRARY_CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  ...AGENT_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export type DeployFromTemplateConfig = {
  agentName: string;
  voiceId: string;
  phoneNumberId: string | null;
  variables: Record<string, string>;
  environment: AgentEnvironment;
};

export function templateToAgentDefaults(
  template: AgentLibraryTemplate,
  config: DeployFromTemplateConfig,
): Partial<Agent> {
  const voice = template.compatibleVoices.find((v) => v.id === config.voiceId);
  let firstMessage = template.defaultFirstMessage;
  for (const [key, value] of Object.entries(config.variables)) {
    firstMessage = firstMessage.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value,
    );
  }

  return {
    name: config.agentName,
    type: template.defaultType,
    category: template.category,
    environment: config.environment,
    firstMessage,
    systemPrompt: template.samplePrompt,
    voice: {
      provider: voice?.provider ?? "ElevenLabs",
      model: voice?.provider === "PlayHT" ? "playht-2.0" : "eleven_turbo_v2",
      name: voice?.name ?? "Professional Neutral",
      latencyMs: 310,
    },
  };
}
