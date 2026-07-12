import { Router } from "express";

import { requireIntegrationsWrite } from "@/lib/integrations/api-guard";
import { isGoogleIntegration } from "@/lib/integrations/google/constants";
import {
  connectIntegrationDb,
  disconnectIntegrationDb,
  getIntegrationById,
  listIntegrations,
} from "@/lib/integrations/db-state";
import type { IntegrationId } from "@/lib/integrations/types";
import { requireTenant } from "@/middleware/tenant";

export const integrationsRouter = Router();

integrationsRouter.get("/", requireTenant(), async (req, res) => {
  const integrations = await listIntegrations(req.tenant!);
  res.json({ integrations });
});

integrationsRouter.get("/:id", requireTenant(), async (req, res) => {
  const integration = await getIntegrationById(req.tenant!, req.params.id as IntegrationId);
  if (!integration) {
    res.status(404).json({ error: "Integration not found" });
    return;
  }
  res.json({ integration });
});

integrationsRouter.post("/:id/connect", requireTenant(), async (req, res) => {
  const id = req.params.id as IntegrationId;

  if (isGoogleIntegration(id)) {
    res.status(400).json({ error: "Use Google OAuth to connect this integration" });
    return;
  }

  const integration = await connectIntegrationDb(req.tenant!, id);
  if (!integration) {
    res.status(404).json({ error: "Integration not found" });
    return;
  }
  res.json({ integration });
});

integrationsRouter.post(
  "/:id/disconnect",
  requireIntegrationsWrite(),
  async (req, res) => {
    const integration = await disconnectIntegrationDb(req.tenant!, req.params.id as IntegrationId);
    if (!integration) {
      res.status(404).json({ error: "Integration not found" });
      return;
    }
    res.json({ integration });
  },
);
