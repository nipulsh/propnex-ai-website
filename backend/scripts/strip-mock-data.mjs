import fs from "fs";

function stripAgents() {
  const path = "lib/agents-data.ts";
  const lines = fs.readFileSync(path, "utf8").split("\n");
  const head = lines.slice(0, 157);
  const tail = lines.slice(549);
  const middle = `
export const DEFAULT_STRUCTURED_OUTPUTS: StructuredOutputField[] = [
  { id: "so-customer-name", name: "Customer Name", description: "Full name of the caller", type: "text", required: true },
  { id: "so-interest-level", name: "Interest Level", description: "Lead interest rating", type: "enum", required: false },
];

export const DEFAULT_SCORECARDS: Scorecard[] = [
  { id: "sc-greeting", name: "Greeting Quality", criteria: "Professional opening", weight: 25 },
];

export const DEFAULT_MONITORS: Monitor[] = [
  { id: "mon-quality", name: "Quality Monitoring", type: "quality", status: "active" },
];

export const initialAgents: Agent[] = [];
export const agents: Agent[] = [];
`.trim().split("\n");
  fs.writeFileSync(path, [...head, ...middle, ...tail].join("\n"));
}

function stripPhoneNumbers() {
  const path = "lib/phone-numbers-data.ts";
  let content = fs.readFileSync(path, "utf8");
  content = content.replace(
    /import \{ agents \} from "@\/lib\/agents-data";\n/,
    "",
  );
  const start = content.indexOf("const agentRef");
  const end = content.indexOf("export function formatPhoneDisplay");
  const replacement = `const dayMs = 24 * 60 * 60 * 1000;

export const initialPhoneNumbers: PhoneNumber[] = [];

`;
  content = content.slice(0, start) + replacement + content.slice(end);
  content = content.replace(
    /export function getPhoneNumberById[\s\S]*?\n\}/,
    `export function getPhoneNumberById(_id: string): PhoneNumber | undefined {
  return undefined;
}`,
  );
  fs.writeFileSync(path, content);
}

stripAgents();
stripPhoneNumbers();

function stripCallLogs() {
  const path = "lib/call-logs-data.ts";
  let content = fs.readFileSync(path, "utf8");
  content = content.replace(/^import[\s\S]*?from "@\/lib\/phone-numbers-data";\n\n/, "");
  content = content.replace(
    /^import \{ agents \} from "@\/lib\/agents-data";\n/,
    "",
  );
  content = content.replace(
    /^import \{[\s\S]*?\} from "@\/lib\/call-detail-data";\n\n/,
    'import type { LeadTemperature } from "@/lib/call-detail-data";\n\n',
  );
  const genStart = content.indexOf("function seededRandom");
  const utilStart = content.indexOf("export function formatCallDate");
  content =
    content.slice(0, genStart) +
    "export const callLogs: CallLog[] = [];\n\n" +
    content.slice(utilStart);
  content = content.replace(
    /export function getCallsForPhoneNumber[\s\S]*?\n\}/,
    `export function getCallsForPhoneNumber(_phoneNumberId: string): CallLog[] {
  return [];
}`,
  );
  fs.writeFileSync(path, content);
}

function stripCallDetail() {
  const path = "lib/call-detail-data.ts";
  let content = fs.readFileSync(path, "utf8");
  content = content.replace(
    /^import \{ callLogs, type CallLog \} from "@\/lib\/call-logs-data";\n\n/,
    'import type { CallLog } from "@/lib/call-logs-data";\n\n',
  );
  const genStart = content.indexOf("function seededRandom");
  const outcomeStart = content.indexOf("export const OUTCOME_OPTIONS");
  const getDetailStart = content.indexOf("const detailCache");
  const tailStart = content.indexOf("export function getLeadTemperatureForCall");
  content =
    content.slice(0, genStart) +
    content.slice(outcomeStart, getDetailStart) +
    `export function getCallDetail(_callId: string): CallDetail | null {
  return null;
}

` +
    content.slice(tailStart);
  fs.writeFileSync(path, content);
}

function stripLeadReactivation() {
  const path = "lib/lead-reactivation-data.ts";
  let content = fs.readFileSync(path, "utf8");
  content = content.replace(/^import \{ agents \} from "@\/lib\/agents-data";\n\n/, "");
  const genStart = content.indexOf("const CONTACT_NAMES");
  const utilStart = content.indexOf("export function formatLastContact");
  const middle = `
export const dormantLeads: DormantLead[] = [];

export const LEAD_REACTIVATION_STATS = {
  dormantLeads: 0,
  reactivationRate: "0%",
  scheduledCalls: 0,
  dormantTrend: "No data yet",
  rateTrend: "No data yet",
  scheduledContext: "No scheduled calls",
};
`;
  content = content.slice(0, genStart) + middle + "\n" + content.slice(utilStart);
  fs.writeFileSync(path, content);
}

function fixCallDetail() {
  const path = "lib/call-detail-data.ts";
  const lines = fs.readFileSync(path, "utf8").split("\n");
  const head = lines.slice(0, 145);
  const tail = `
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
  return \`\${m}:\${s.toString().padStart(2, "0")}\`;
}

export function formatCallCost(cost: number): string {
  return \`$\${cost.toFixed(2)}\`;
}
`.trim().split("\n");
  fs.writeFileSync(path, [...head, ...tail].join("\n"));
}

fixCallDetail();
