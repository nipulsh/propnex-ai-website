# Backend Architecture

This document describes how server-side logic is organized in the PropNex AI main website. The app is a **Next.js 16 App Router** monolith: the same Node.js process serves pages, REST routes, GraphQL, webhooks, and Server Actions.

---

## High-level overview

```mermaid
React UI
    │
    ▼
proxy.ts (Auth + Routing)
    │
    ├── GraphQL API ──► Context ──► Resolvers ──► Services ──► Repositories ──► MongoDB
    │                                                            │
    │                                                            └── Redis
    │
    ├── REST APIs ──► Services/Mock Data
    │
    ├── Server Actions ──► Services/Mock Data
    │
    └── Clerk Webhooks ──► Clerk

Clerk Auth/Organizations ◄── Context Resolution
  UI --> Proxy
  Proxy --> GQL
  Proxy --> REST
  Proxy --> SA
  Clerk --> WH

  GQL --> CTX --> RES --> SVC --> REPO --> Prisma
  SVC --> Redis
  WH --> SVC

  REST --> IntState
  REST --> LibData
  UI --> LibData
  SA --> Clerk
  SA --> SVC
```

The backend is intentionally **split into two tracks**:

| Track                      | Location                                        | Purpose                                                                                         |
| -------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Production stack**       | `src/server/`                                   | Multi-tenant data access, GraphQL API, Clerk sync, caching, RBAC                                |
| **Prototype / mock stack** | `lib/*-data.ts`, `lib/api/integration-state.ts` | Static and in-memory data powering much of the agents, phone numbers, integrations, and tool UI |

Several dashboard areas already call the real GraphQL API (home, billing, call logs). Other pages still read from mock modules until wired to `src/server`.

---

## Request entry points

### 1. Edge middleware — `proxy.ts`

`proxy.ts` runs on almost every request (pages and API). It:

- Integrates **Clerk** via `clerkMiddleware`
- Protects non-public routes (`auth.protect()`)
- Redirects authenticated users from `/` → `/dashboard`
- Allows public routes: `/`, `/pricing`, `/sign-in`, `/sign-up`, `/api/webhooks/*`

Contract ID linking is configured from Settings and is independent of authentication middleware.

Public API webhooks bypass auth so Clerk can POST signed events.

### 2. GraphQL — `app/api/graphql/route.ts`

Primary API for tenant-scoped dashboard data.

- **Runtime:** `nodejs`
- **Server:** GraphQL Yoga (`src/server/graphql/yoga.ts`)
- **Schema:** SDL files in `src/server/graphql/schema/**/*.graphql`, merged in `src/server/graphql/server.ts`
- **Resolvers:** `src/server/resolvers/index.ts` — thin layer delegating to services
- **Client:** `lib/graphql/client.ts` (`graphql-request`, cookies via `credentials: "include"`)

**Domains exposed today:** viewer, credits, billing, call logs, analytics, agents, leads, notifications, integrations, scheduler, system events.

### 3. REST route handlers — `app/api/**`

Next.js Route Handlers for operations that are not yet (or not suitable for) GraphQL:

| Area           | Routes                                                                            | Backend                                                     |
| -------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Integrations   | `/api/integrations/**`                                                            | In-memory `lib/api/integration-state.ts` + mock Google data |
| Agent tools    | `/api/agents/[agentId]/tools/**`                                                  | In-memory tool assignments                                  |
| Tool execution | `/api/tools/faq/search`, `billing/lookup`, `google-calendar/*`, `google-sheets/*` | Mostly stub / keyword-matched responses                     |
| Webhooks       | `/api/webhooks/clerk`                                                             | `src/server/services/clerk-provision.service.ts`            |
| Contract ID    | `/api/company/contract`, `/api/company/contract/link`                             | `src/server/services/contract.service.ts` (auth-only)       |

All REST handlers that need a logged-in user use `requireAuth()` from `lib/api/auth.ts` (Clerk `auth()` → 401 if missing).

### 4. Contract ID linking — Settings + `/api/company/contract/**`

Users link an admin-provided Contract ID from Settings. The link API uses Clerk auth only (no tenant context required). `contract.service.ts` validates format, checks eligibility, creates membership, and sets `ownerUserId` / `claimedAt` once.

---

## Layered backend (`src/server/`)

Production backend follows a consistent **repository → service → resolver** flow.

```
GraphQL request
    → createGraphQLContext()     # auth + tenant + permissions + loaders
    → resolver                   # maps GraphQL args to service calls
    → service                    # business rules, permissions, cache
    → repository                 # Prisma queries scoped by companyId
    → MongoDB
```

### Repositories (`src/server/repositories/`)

- Extend `BaseRepository`, which provides `scope(companyId)` for tenant filtering
- One repository per domain: `tenant`, `call-logs`, `credits`, `billing`, `agents`, `leads`, `events`, `notifications`, etc.
- **Every query includes `companyId`** — tenant isolation is enforced at the data layer (see `src/server/__tests__/tenant-isolation.test.ts`)

### Services (`src/server/services/`)

- Contain business logic, permission checks, and cache orchestration
- Use `tenantService.requirePermission(ctx, PERMISSIONS.*)` before reads/writes
- Examples: `call-logs.service.ts`, `credits.service.ts`, `billing.service.ts`, `tenant.service.ts`

### Resolvers (`src/server/resolvers/`)

- Map GraphQL types and namespaces (`CreditsQueries`, `CallLogsMutations`, etc.) to service methods
- Field resolvers use **DataLoaders** (`src/server/graphql/dataloaders.ts`) to avoid N+1 queries for leads, agents, and users on call logs

### Shared libraries (`src/server/lib/`)

| Module          | Role                                                               |
| --------------- | ------------------------------------------------------------------ |
| `prisma.ts`     | Singleton Prisma client (dev hot-reload safe)                      |
| `errors.ts`     | `AppError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError` |
| `pagination.ts` | Cursor encoding/decoding for relay-style connections               |
| `clerk-sync.ts` | Helpers for Clerk ↔ DB sync (e.g. company slug)                    |

`lib/prisma.ts` re-exports `@/server/lib/prisma` for convenience elsewhere in the app.

---

## Authentication & multi-tenancy

### Clerk

- **Identity:** Clerk user sessions (cookies)
- **Organizations:** Clerk org ↔ `Company.clerkOrganizationId` in MongoDB
- **Contract ID:** Admin-created companies have a unique `contractId`; users claim via Settings (one-time, immutable)

### Provisioning flow

1. Admin creates company in admin panel → `contractId` generated
2. User signs up / signs in → dashboard (no Contract ID gate)
3. User links Contract ID in Settings → `contract.service.linkContractId()`:
   - Upserts `User` in MongoDB
   - Attaches Clerk organization (or local fallback) to the admin company
   - Creates `CompanyMember` with role `OWNER`
   - Sets `ownerUserId` and `claimedAt` (conditional on unclaimed)

### Webhook sync — `app/api/webhooks/clerk/route.ts`

- Verifies **Svix** signatures (`CLERK_WEBHOOK_SECRET`)
- Handles `user.*`, `organization.*`, `organizationMembership.*` events
- Keeps `User`, `Company`, and `CompanyMember` in sync
- Invalidates Redis permission cache on membership changes

### GraphQL tenant context — `src/server/graphql/context.ts`

For each GraphQL request:

1. Read `userId` and `orgId` from Clerk `auth()`
2. Resolve `Company` from Clerk org id (fallback: first active membership)
3. Resolve `User` + `CompanyMember`
4. Build permission list (role + custom role permissions, cached in Redis)
5. Attach per-request DataLoaders scoped to `companyId`

If any step fails → `UnauthorizedError`.

### RBAC — `src/server/types/permissions.ts`

- Permissions are string constants (`billing:read`, `call_logs:write`, etc.)
- `UserRole` (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`) maps to default permission sets
- Custom `Role` documents in MongoDB can add permissions per member
- Services call `requirePermission` before sensitive operations

---

## Data stores

### MongoDB (primary) — Prisma

- **ORM:** Prisma 6 with MongoDB provider
- **Schema:** `prisma/schema.prisma` — large multi-tenant model covering companies, users, leads, call logs, AI agents, billing, credits, integrations, analytics, etc.
- **CLI:** `npm run db:push`, `db:studio`, `db:generate` (loads `.env.local`)

All production reads/writes in `src/server` go through Prisma.

### MongoDB (raw client) — `lib/mongodb.ts`

A native `MongoClient` wrapper exists for direct driver access (`getDb`, `pingMongo`). It is **not** used by the GraphQL stack today; Prisma is the canonical path.

### Redis (optional) — `src/server/cache/`

- Client: `ioredis` via `REDIS_URL`
- If unset, caching is silently disabled (no request failures)
- `CacheService` provides `get`, `set`, `getOrSet`, and domain invalidation helpers
- Cached today: user permissions, top call logs, credits summary, analytics, agent status
- TTLs defined in `src/server/cache/keys.ts`

---

## GraphQL schema organization

```
src/server/graphql/schema/
├── root.graphql          # Query, Mutation, shared enums, Viewer, Company
├── domains.graphql       # agents, leads, notifications, integrations, scheduler, events
├── call-logs.graphql
├── credits.graphql
└── billing.graphql
```

Resolvers are grouped by GraphQL namespace (e.g. `CallLogsQueries`, `CreditsMutations`) rather than one flat `Query` object — this keeps domains modular as the API grows.

Errors from `AppError` subclasses surface to clients in development; other errors are masked in production (`yoga.ts` `maskedErrors`).

---

## Frontend ↔ backend wiring

### Live GraphQL (real DB)

| UI area        | Hook / API                | GraphQL domain                                               |
| -------------- | ------------------------- | ------------------------------------------------------------ |
| Home dashboard | `useHomeDashboardGraphQL` | credits, analytics, agents, events, notifications, scheduler |
| Call logs      | `useCallLogsGraphQL`      | call logs                                                    |
| Billing        | `useBillingGraphQL`       | billing, credits                                             |

Helpers: `lib/graphql/api.ts`, `lib/graphql/queries.ts`.

### Mock / static data (not yet on GraphQL)

| UI area                 | Data source                                            |
| ----------------------- | ------------------------------------------------------ |
| Agents list & detail    | `lib/agents-data.ts`                                   |
| Phone numbers           | `lib/phone-numbers-data.ts`                            |
| Call detail (rich view) | `lib/call-detail-data.ts`                              |
| Lead reactivation       | `lib/lead-reactivation-data.ts`                        |
| Integrations UI         | REST → `lib/api/integration-state.ts`                  |
| Agent tool config       | REST → in-memory tool state                            |
| Usage ticker            | Client-side simulation (`hooks/use-realtime-usage.ts`) |

When migrating a screen to the real backend, add or extend a service + repository, expose fields in GraphQL (or REST), and replace the `lib/*-data` import with a GraphQL hook or server fetch.

---

## Environment variables

| Variable                             | Used by                             |
| ------------------------------------ | ----------------------------------- |
| `DATABASE_URL`                       | Prisma, `lib/mongodb.ts`            |
| `MONGODB_URI`                        | Fallback for raw Mongo client       |
| `REDIS_URL`                          | Optional Redis cache                |
| `CLERK_*`                            | Clerk SDK (publishable/secret keys) |
| `CLERK_WEBHOOK_SECRET`               | Clerk webhook verification          |
| `NEXT_PUBLIC_APP_URL` / `VERCEL_URL` | Server-side GraphQL client base URL |

Secrets belong in `.env.local` (gitignored).

---

## Testing

```bash
npm test
```

Runs Node test runner against `src/server/__tests__/**/*.test.ts`. Current coverage focuses on **tenant isolation** in repositories (ensuring queries never leak across `companyId`).

---

## Directory reference

```
propnex-main-website/
├── proxy.ts                          # Clerk middleware
├── actions/                          # Server Actions (billing, etc.)
├── app/api/
│   ├── graphql/route.ts              # GraphQL endpoint
│   ├── webhooks/clerk/route.ts       # Clerk → DB sync
│   ├── integrations/                 # Mock integration REST API
│   ├── agents/                         # Agent tool REST API (mock)
│   └── tools/                          # Tool execution stubs
├── lib/
│   ├── api/auth.ts                   # REST auth helper
│   ├── api/integration-state.ts      # In-memory integration state
│   ├── graphql/                      # GraphQL client + query helpers
│   ├── mongodb.ts                    # Raw Mongo client (secondary)
│   └── *-data.ts                     # Mock/static UI data
├── prisma/schema.prisma              # MongoDB data model
└── src/server/
    ├── cache/                        # Redis client + cache service
    ├── graphql/                      # Yoga, schema, context, dataloaders
    ├── lib/                          # Prisma, errors, pagination
    ├── repositories/                 # Tenant-scoped data access
    ├── resolvers/                    # GraphQL resolvers + guards
    ├── services/                     # Business logic
    ├── types/                        # Context, permissions, generated types
    └── __tests__/                    # Backend unit tests
```

---

## Design principles in practice

1. **Tenant-first queries** — `companyId` is required in repositories; never trust client-supplied tenant ids without matching session context.
2. **Thin resolvers, fat services** — GraphQL stays a transport layer; rules live in services.
3. **Graceful cache degradation** — Redis absence must not break requests.
4. **Clerk as source of truth for identity** — MongoDB users/orgs are synced via Contract ID linking + webhooks.
5. **Incremental migration** — Mock `lib/*` modules allow UI progress while `src/server` grows domain by domain.

---

## Related commands

```bash
npm run dev          # Start Next.js (API + UI)
npm run db:push      # Push Prisma schema to MongoDB
npm run db:studio    # Prisma Studio
npm run test         # Backend tests
```
