import { NextResponse } from "next/server";

const COMPANY_ID_HEADER = "x-company-id";
const API_KEY_HEADER = "x-agent-server-key";

export function validateAgentServerRequest(req: Request): {
  companyId: string;
  error?: NextResponse;
} {
  const expectedKey = process.env.AGENT_SERVER_API_KEY;
  if (!expectedKey) {
    return {
      companyId: "",
      error: NextResponse.json(
        { error: "Agent server API key is not configured" },
        { status: 503 },
      ),
    };
  }

  const providedKey = req.headers.get(API_KEY_HEADER);
  if (!providedKey || providedKey !== expectedKey) {
    return {
      companyId: "",
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const companyId = req.headers.get(COMPANY_ID_HEADER)?.trim();
  if (!companyId) {
    return {
      companyId: "",
      error: NextResponse.json(
        { error: "X-Company-Id header is required" },
        { status: 400 },
      ),
    };
  }

  return { companyId };
}
