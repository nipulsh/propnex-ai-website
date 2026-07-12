import { Router } from "express";

import { syncDialerCallToSheetDb } from "@/lib/integrations/db-state";
import { createServiceTenantContext, requireAgentServerKey } from "@/middleware/tenant";

export const internalRouter = Router();

internalRouter.post("/dialer/sheets-sync", requireAgentServerKey(), async (req, res) => {
  const body = req.body as { callId?: string };
  const callId = body.callId?.trim();
  if (!callId) {
    res.status(400).json({ error: "callId is required" });
    return;
  }

  try {
    const ctx = createServiceTenantContext(req.serviceCompanyId!);
    const result = await syncDialerCallToSheetDb(ctx, callId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Sheets sync failed" });
  }
});
