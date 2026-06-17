import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";

const FAQ_ANSWERS: Record<string, string> = {
  pricing:
    "PropNex AI offers flexible plans starting from pay-as-you-go credits. Enterprise plans include custom integrations and dedicated support.",
  company:
    "PropNex AI is a voice AI platform for real estate and sales teams, enabling automated phone conversations with AI agents.",
  product:
    "Our platform includes inbound/outbound AI agents, call analytics, lead qualification, and integrations with CRM and calendar tools.",
  default:
    "I found some relevant information in our knowledge base. Would you like me to elaborate on a specific topic?",
};

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await req.json()) as { query?: string; agentId?: string };
  const query = (body.query ?? "").toLowerCase();

  let answer = FAQ_ANSWERS.default;
  let confidence = 0.65;

  if (query.includes("price") || query.includes("cost") || query.includes("plan")) {
    answer = FAQ_ANSWERS.pricing;
    confidence = 0.92;
  } else if (query.includes("company") || query.includes("about") || query.includes("propnex")) {
    answer = FAQ_ANSWERS.company;
    confidence = 0.88;
  } else if (query.includes("product") || query.includes("feature")) {
    answer = FAQ_ANSWERS.product;
    confidence = 0.85;
  }

  return NextResponse.json({ answer, confidence, sources: ["Product FAQ"] });
}
