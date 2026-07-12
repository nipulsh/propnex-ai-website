import "dotenv/config";
import cors from "cors";
import express from "express";

import { agentsRouter } from "@/routes/agents";
import { companyRouter } from "@/routes/company";
import { contactPhonesRouter } from "@/routes/contact-phones";
import { eventsRouter } from "@/routes/events";
import { integrationsRouter } from "@/routes/integrations";
import { integrationsGoogleRouter } from "@/routes/integrations-google";
import { internalRouter } from "@/routes/internal";
import { pageCacheRouter } from "@/routes/page-cache";
import { publicRouter } from "@/routes/public";
import { toolsRouter } from "@/routes/tools";
import { webhooksRouter } from "@/routes/webhooks";
import { yoga } from "@/server/graphql/yoga";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());
const isDev = process.env.NODE_ENV !== "production";
const isLocalhost = (origin: string) => /^https?:\/\/localhost(:\d+)?$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin/non-browser requests (curl, server-to-server) send no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Next.js hops ports locally when one's taken — don't let that 404-by-CORS in dev.
      if (isDev && isLocalhost(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed`));
    },
  }),
);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Needs the raw body for svix signature verification — must run before express.json().
app.use("/webhooks", express.raw({ type: "*/*" }), webhooksRouter);

// graphql-yoga reads the raw request stream itself — must be mounted before express.json().
app.use(yoga.graphqlEndpoint, (req, res) => yoga(req, res));

app.use(express.json({ limit: "10mb" }));

app.use("/company", companyRouter);
app.use("/contact-phones", contactPhonesRouter);
app.use("/events", eventsRouter);
app.use("/integrations/google", integrationsGoogleRouter);
app.use("/integrations", integrationsRouter);
app.use("/internal", internalRouter);
app.use("/page-cache", pageCacheRouter);
app.use("/public", publicRouter);
app.use("/tools", toolsRouter);
app.use("/agents", agentsRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[backend] listening on :${port}`);
});
