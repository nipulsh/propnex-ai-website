# PropNex Main Website — Architecture

## Overview

The PropNex main website is a **Next.js 16 (App Router)** full-stack application that serves as the primary tenant-facing dashboard for the PropNex AI calling platform. It combines a React UI, a GraphQL API, REST endpoints, Server Actions, and Clerk-based authentication all in a single Node.js process. It runs on port `3000` by default.

---

## System Context

```
Browser (React UI)
    │
    ▼
proxy.ts — Clerk Auth middleware (edge)
    │
    ├── GraphQL API (/api/graphql) ──► GraphQL Yoga ──► Resolvers ──► Services ──► Repositories ──► MongoDB (Prisma)
    │                                                                                 │
    │                                                                                 └── Redis (optional cache)
    │
    ├── REST API handlers (/api/**) ──► Mock/in-memory state or real services
    │
    ├── Server Actions (actions/) ──► Onboarding, Clerk metadata
    │
    └── Webhooks (/api/webhooks/clerk) ──► Clerk event sync ──► MongoDB
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Component library | shadcn/ui (Radix UI primitives) |
| State management | Zustand |
| Authentication | Clerk (@clerk/nextjs) |
| ORM | Prisma 6 (MongoDB provider) |
| Primary DB | MongoDB |
| Cache | Redis (ioredis, optional) |
| GraphQL server | GraphQL Yoga |
| GraphQL client | graphql-request |
| Icons | lucide-react |

---

## Directory Structure

```
propnex-main-website/
├── proxy.ts                        # Clerk middleware — auth and routing
├── actions/                        # Next.js Server Actions
├── app/
│   ├── (public)/                   # Public pages (landing, pricing)
│   ├── (dashboard)/                # Protected tenant dashboard pages
│   │   ├── agents/                 # AI agent management UI
│   │   ├── billing/                # Billing and credits
│   │   ├── call-logs/              # Call history
│   │   ├── dashboard/              # Overview / home
│   │   ├── lead-reactivation/      # Lead re-engagement campaigns
│   │   ├── phone-numbers/          # Phone number management
│   │   ├── settings/               # Account settings (incl. Contract ID linking)
│   │   ├── setup/                  # Channel/telephony setup
│   │   └── tools/                  # Agent tool catalog
│   ├── api/
│   │   ├── graphql/route.ts        # GraphQL endpoint (Node.js runtime)
│   │   ├── webhooks/clerk/         # Clerk → MongoDB sync webhook
│   │   ├── agents/                 # Agent tools REST API
│   │   ├── integrations/           # Integration state REST API
│   │   ├── company/contract/       # Contract ID link status + linking
│   │   └── internal/               # Internal inter-service endpoints
│   ├── sign-in/ & sign-up/         # Clerk-hosted auth pages
│   └── layout.tsx                  # Root layout
├── components/                     # React UI components (feature-organised)
├── hooks/                          # GraphQL query hooks (useXxxGraphQL)
├── lib/                            # Client and server utility modules
│   ├── graphql/                    # GraphQL client + query helpers
│   ├── api/                        # REST auth + integration state
│   ├── *-data.ts                   # Mock/static data for non-wired pages
│   └── mongodb.ts                  # Raw MongoDB client (secondary)
├── stores/                         # Zustand client-side stores
├── types/                          # Global TypeScript types
├── prisma/
│   └── schema.prisma               # MongoDB data model
└── src/server/                     # Production backend
    ├── cache/                      # Redis client + CacheService
    ├── graphql/                    # GraphQL Yoga server, schema, context, dataloaders
    ├── lib/                        # Prisma singleton, errors, pagination helpers
    ├── repositories/               # Tenant-scoped Prisma data access
    ├── resolvers/                  # GraphQL resolvers grouped by domain
    ├── services/                   # Business logic + permission checks
    ├── types/                      # GraphQL context, RBAC permissions
    └── __tests__/                  # Backend unit tests (tenant isolation)
```

---

## Request Pipeline

### 1. Edge Middleware — `proxy.ts`

Runs on every request via Clerk's `clerkMiddleware`. Responsibilities:

- Authenticates users via Clerk session cookies
- Protects all non-public routes with `auth.protect()`
- Redirects authenticated users from `/` → `/dashboard`
- Public routes: `/`, `/pricing`, `/sign-in`, `/sign-up`, `/api/webhooks/*`

Contract ID linking is **not** enforced in middleware. Users link a Contract ID from Settings (`/api/company/contract/link`).

### 2. GraphQL API — `/api/graphql`

Primary data API for all tenant dashboard data.

- **Server:** GraphQL Yoga (`src/server/graphql/yoga.ts`)
- **Schema:** SDL files in `src/server/graphql/schema/` (call-logs, credits, billing, agents, domains, etc.)
- **Context:** `src/server/graphql/context.ts` — resolves Clerk session → Company → User → permissions → DataLoaders
- **Resolvers:** Grouped by domain namespace (e.g. `CallLogsQueries`, `CreditsMutations`)
- **DataLoaders:** Batch-load leads, agents, and users to avoid N+1 queries

### 3. REST API Handlers — `app/api/**`

| Path | Purpose |
|---|---|
| `/api/integrations/**` | In-memory integration state + mock Google data |
| `/api/agents/[id]/tools/**` | In-memory agent tool assignments |
| `/api/tools/**` | Tool execution stubs (FAQ, billing, calendar, sheets) |
| `/api/webhooks/clerk` | Clerk event → MongoDB sync (Svix verified) |
| `/api/company/contract/**` | Contract ID link status and one-time linking |
| `/api/internal/dialer/**` | Called by the agent server for Google Sheets sync |

### 4. Server Actions — `actions/`

Billing and other server actions live under `actions/`. Company provisioning happens via Contract ID linking in Settings, not during signup.

---

## Backend Layers (`src/server/`)

The production backend follows a consistent layered pattern:

```
GraphQL request
    → createGraphQLContext()     # resolves auth + tenant + RBAC + DataLoaders
    → resolver                   # maps GraphQL args to service method calls
    → service                    # business rules, permission checks, cache
    → repository                 # Prisma queries always scoped by companyId
    → MongoDB
```

### Repositories

- Extend `BaseRepository` which enforces `companyId` scoping on every query
- One repository per domain: `tenant`, `call-logs`, `credits`, `billing`, `agents`, `leads`, `events`, `notifications`
- Tenant isolation is enforced at the data layer — no cross-tenant leakage is possible

### Services

- Hold all business logic and permission enforcement
- Use `tenantService.requirePermission(ctx, PERMISSIONS.*)` before any sensitive read/write
- Coordinate caching via `CacheService` (Redis-backed, fails silently if Redis is absent)

### Resolvers

- Thin delegation layer from GraphQL to services
- Organised into domain namespaces to keep the codebase modular

---

## Authentication & Multi-Tenancy

- **Identity:** Clerk user sessions (HTTP-only cookies)
- **Organizations:** Clerk org ↔ `Company.clerkOrganizationId` in MongoDB
- **RBAC:** `UserRole` enum (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`) maps to default permission sets stored per `CompanyMember`. Custom `Role` documents can extend permissions.
- **Provisioning:** Users link an admin-provided Contract ID from Settings (`contract.service.ts`), which creates `CompanyMember` (OWNER) and sets `ownerUserId` / `claimedAt` once.
- **Webhook sync:** Clerk fires `user.*` / `organization.*` / `organizationMembership.*` events which are verified via Svix and used to keep MongoDB in sync. Permission cache is invalidated on membership changes.

---

## Data Stores

### MongoDB (primary)

- Prisma 6 with MongoDB provider
- Multi-tenant schema: `Company`, `User`, `CompanyMember`, `Lead`, `CallLog`, `AiAgent`, `Channel`, `DialerCall`, `CreditBalance`, `BillingSubscription`, and many more
- All queries include `companyId` for tenant isolation

### Redis (optional)

- ioredis client, disabled if `REDIS_URL` is absent
- Caches: user permissions, call logs summary, credits, analytics snapshots, agent status
- TTLs defined in `src/server/cache/keys.ts`

---

## Frontend Data Wiring

Some dashboard areas call the real GraphQL API; others still use mock `lib/*-data.ts` modules:

| Area | Status | Data source |
|---|---|---|
| Home dashboard | Live | GraphQL (`useHomeDashboardGraphQL`) |
| Call logs | Live | GraphQL (`useCallLogsGraphQL`) |
| Billing | Live | GraphQL (`useBillingGraphQL`) |
| Agents list/detail | Mock | `lib/agents-data.ts` |
| Phone numbers | Mock | `lib/phone-numbers-data.ts` |
| Lead reactivation | Mock | `lib/lead-reactivation-data.ts` |
| Integrations UI | Mock + REST | `lib/api/integration-state.ts` |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB connection string (Prisma) |
| `REDIS_URL` | Optional Redis cache |
| `CLERK_SECRET_KEY` | Clerk server-side key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client-side key |
| `CLERK_WEBHOOK_SECRET` | Svix webhook signature verification |
| `NEXT_PUBLIC_APP_URL` | Base URL for server-side GraphQL client |

---

## Scripts

```bash
npm run dev               # Start Next.js dev server (port 3000)
npm run build             # Bundle GraphQL schema + Next.js build
npm run test              # Node test runner — backend unit tests
npm run db:push           # Push Prisma schema to MongoDB
npm run db:studio         # Open Prisma Studio
npm run db:generate       # Regenerate Prisma client
```
