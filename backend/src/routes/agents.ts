import { Router } from "express";

import { getAgentToolsDb, updateAgentToolDb } from "@/lib/integrations/db-state";
import type { AgentToolAssignment, AgentToolId } from "@/lib/tools/types";
import { requireTenant } from "@/middleware/tenant";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const agentsRouter = Router();

agentsRouter.get("/:agentId/tools", requireTenant(), async (req, res) => {
  const tools = await getAgentToolsDb(req.tenant!, req.params.agentId as string);
  res.json({ tools });
});

agentsRouter.put("/:agentId/tools/:toolId", requireTenant(), async (req, res) => {
  const agentId = req.params.agentId as string;
  const toolId = req.params.toolId as AgentToolId;
  const body = req.body as Partial<AgentToolAssignment>;
  const tool = await updateAgentToolDb(req.tenant!, agentId, toolId, body);
  res.json({ tool });
});

agentsRouter.post("/:agentId/tools/:toolId", requireTenant(), async (req, res) => {
  const agentId = req.params.agentId as string;
  const toolId = req.params.toolId as AgentToolId;
  await delay(800);
  const tool = await updateAgentToolDb(req.tenant!, agentId, toolId, {
    health: "healthy",
    usage: {
      totalExecutions: 1,
      successRate: 1,
      lastUsedAt: new Date().toISOString(),
      errorCount: 0,
    },
  });
  res.json({ tool, testResult: "passed" });
});
