import { Router } from "express";

import { isAppError } from "@/server/lib/errors";
import { eventsService } from "@/server/services/events.service";
import { requireTenant } from "@/middleware/tenant";

export const eventsRouter = Router();

eventsRouter.post("/support-contact", requireTenant(), async (req, res) => {
  const input = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!input.name?.trim()) {
    res.status(400).json({ error: "Full Name is required." });
    return;
  }
  if (!input.email?.trim()) {
    res.status(400).json({ error: "Email is required." });
    return;
  }
  if (!input.subject?.trim()) {
    res.status(400).json({ error: "Subject is required." });
    return;
  }
  if (!input.message?.trim()) {
    res.status(400).json({ error: "Query / Message is required." });
    return;
  }

  try {
    const event = await eventsService.emit(req.tenant!, {
      type: "BILLING_ALERT",
      entityType: "support_contact_request",
      title: `Branch support: ${input.subject}`,
      payload: {
        name: input.name.trim(),
        email: input.email.trim(),
        subject: input.subject.trim(),
        message: input.message.trim(),
        submittedAt: new Date().toISOString(),
      },
    });
    res.json({ requestId: event.id });
  } catch (err) {
    if (isAppError(err)) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Unable to submit your support query right now." });
  }
});

eventsRouter.post("/billing-contact", requireTenant(), async (req, res) => {
  const input = req.body as {
    intent?: string;
    quantity?: number;
    phone?: string;
    notes?: string;
  };

  try {
    const event = await eventsService.emit(req.tenant!, {
      type: "BILLING_ALERT",
      entityType: "billing_contact_request",
      title: `Billing request: ${input.intent}`,
      payload: {
        intent: input.intent,
        quantity: input.quantity,
        phone: input.phone?.trim() || null,
        notes: input.notes?.trim() || null,
        submittedAt: new Date().toISOString(),
      },
    });
    res.json({ requestId: event.id });
  } catch (err) {
    if (isAppError(err)) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Unable to submit your request right now." });
  }
});
