import { Router } from "express";

import { requireAgentsWrite } from "@/lib/integrations/api-guard";
import {
  addCalendarEventDb,
  appendSheetRowDb,
  deleteCalendarEventDb,
  getCalendarConfigDb,
  getCalendarEventsDb,
  readSheetRowDb,
  updateCalendarEventDb,
  writeSheetRowDb,
} from "@/lib/integrations/db-state";
import type { SheetRow } from "@/lib/integrations/types";
import { billingSummary } from "@/lib/billing-data";
import { requireAuth } from "@/middleware/tenant";

export const toolsRouter = Router();

toolsRouter.post("/billing/lookup", requireAuth(), async (req, res) => {
  const body = req.body as {
    permissions?: { creditAccess?: boolean; planAccess?: boolean; invoiceAccess?: boolean };
  };
  const permissions = body.permissions ?? {
    creditAccess: true,
    planAccess: true,
    invoiceAccess: true,
  };

  const result: Record<string, unknown> = {};

  if (permissions.creditAccess) {
    result.credits = {
      remaining: billingSummary.remainingCredits,
      total: billingSummary.totalCredits,
      used: billingSummary.usedCredits,
    };
  }
  if (permissions.planAccess) {
    result.plan = { name: billingSummary.activePlan, resetDate: billingSummary.resetDate };
  }
  if (permissions.invoiceAccess) {
    result.invoice = {
      nextAmount: billingSummary.nextInvoiceAmount,
      dueDate: billingSummary.nextInvoiceDue,
      status: "paid",
    };
  }

  res.json(result);
});

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

toolsRouter.post("/faq/search", requireAuth(), async (req, res) => {
  const body = req.body as { query?: string; agentId?: string };
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

  res.json({ answer, confidence, sources: ["Product FAQ"] });
});

toolsRouter.post("/google-calendar/availability", requireAgentsWrite(), async (req, res) => {
  const config = await getCalendarConfigDb(req.tenant!);
  res.json({
    available: true,
    timezone: config.timezone,
    workingHours: config.workingHours,
    meetingDurationMinutes: config.meetingDurationMinutes,
    bufferMinutes: config.bufferMinutes,
  });
});

toolsRouter.post("/google-calendar/events", requireAgentsWrite(), async (req, res) => {
  const ctx = req.tenant!;
  const body = req.body as {
    action: "create" | "reschedule" | "cancel" | "list";
    eventId?: string;
    title?: string;
    start?: string;
    end?: string;
    attendeeEmail?: string;
  };

  switch (body.action) {
    case "list":
      res.json({ events: await getCalendarEventsDb(ctx) });
      return;
    case "create": {
      const event = await addCalendarEventDb(ctx, {
        title: body.title ?? "Appointment",
        start: body.start ?? new Date().toISOString(),
        end: body.end ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        attendeeEmail: body.attendeeEmail,
      });
      res.json({ event });
      return;
    }
    case "reschedule": {
      if (!body.eventId) {
        res.status(400).json({ error: "eventId required" });
        return;
      }
      const event = await updateCalendarEventDb(ctx, body.eventId, { start: body.start, end: body.end });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json({ event });
      return;
    }
    case "cancel": {
      if (!body.eventId) {
        res.status(400).json({ error: "eventId required" });
        return;
      }
      const deleted = await deleteCalendarEventDb(ctx, body.eventId);
      if (!deleted) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json({ success: true });
      return;
    }
    default:
      res.status(400).json({ error: "Invalid action" });
  }
});

toolsRouter.post("/google-sheets/execute", requireAgentsWrite(), async (req, res) => {
  const ctx = req.tenant!;
  const body = req.body as {
    action: "read" | "write" | "append" | "update";
    rowIndex?: number;
    data?: SheetRow;
  };

  try {
    if (body.action === "read") {
      if (body.rowIndex === undefined) {
        res.status(400).json({ error: "rowIndex required" });
        return;
      }
      const row = await readSheetRowDb(ctx, body.rowIndex);
      res.json({ row });
      return;
    }

    if (body.action === "append" && body.data) {
      const row = await appendSheetRowDb(ctx, body.data);
      res.json({ row });
      return;
    }

    if ((body.action === "write" || body.action === "update") && body.data && body.rowIndex !== undefined) {
      const row = await writeSheetRowDb(ctx, body.rowIndex, body.data);
      res.json({ row });
      return;
    }

    res.status(400).json({ error: "Invalid action" });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Execute failed" });
  }
});
