# PropNex AI — Backend API Documentation

This document describes every backend API route in the PropNex AI dashboard, how each is used, when it is called, helper functions involved, import sources, expected responses, and error scenarios.

**Stack:** Next.js App Router route handlers (`app/api/**`), GraphQL Yoga (`/api/graphql`), Clerk authentication, Prisma + PostgreSQL, optional Redis page cache.

**Last updated:** June 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication & Shared Helpers](#authentication--shared-helpers)
3. [GraphQL API — `/api/graphql`](#graphql-api--apigraphql)
4. [Page Cache API — `/api/page-cache/[pageKey]`](#page-cache-api--apipage-cachepagekey)
5. [Clerk Webhook — `/api/webhooks/clerk`](#clerk-webhook--apiwebhooksclerk)
6. [Integrations REST APIs](#integrations-rest-apis)
7. [Agent Tools REST APIs](#agent-tools-rest-apis)
8. [Contact Phones REST API](#contact-phones-rest-api)
9. [Voice Agent Runtime Tool APIs](#voice-agent-runtime-tool-apis)
10. [Agent Server Internal APIs](#agent-server-internal-apis)
11. [Client Call Matrix](#client-call-matrix)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  React Client   │────▶│  /api/page-cache/*   │────▶│  GraphQL Yoga   │
│  (dashboard)    │     │  (Redis-cached)      │     │  /api/graphql   │
└────────┬────────┘     └──────────────────────┘     └────────┬────────┘
         │                                                      │
         │  direct GraphQL (mutations)                          │
         └──────────────────────────────────────────────────────┘
         │
         │  REST (integrations, agent tools, file upload)
         ▼
┌─────────────────┐     ┌──────────────────────┐
│  REST handlers  │────▶│  Services / Prisma   │
└─────────────────┘     └──────────────────────┘

┌─────────────────┐
│  Clerk Webhooks │────▶ clerk-provision.service (user/org sync)
└─────────────────┘
```

| Layer | Path prefix | Purpose |
|-------|-------------|---------|
| GraphQL | `/api/graphql` | Primary data API (agents, calls, billing, contacts, leads, etc.) |
| Page cache | `/api/page-cache/[pageKey]` | Cached dashboard page payloads (wraps GraphQL server-side) |
| Integrations | `/api/integrations/**` | Google Sheets/Calendar config, connect/disconnect |
| Agent tools | `/api/agents/[agentId]/tools/**` | Per-agent tool enablement and config |
| Contact upload | `/api/contact-phones/parse-upload` | Server-side parsing of Excel/PDF/Word uploads |
| Runtime tools | `/api/tools/**` | Endpoints invoked by voice agents during calls |
| Webhooks | `/api/webhooks/clerk` | Clerk → database tenant provisioning |

**Middleware:** `proxy.ts` protects all routes except public pages and `/api/webhooks/*`. All other APIs require a signed-in Clerk session (cookies).

---

## Authentication & Shared Helpers

### `requireAuth()`

| | |
|---|---|
| **File** | `lib/api/auth.ts` |
| **Import** | `@clerk/nextjs/server` → `auth()` |
| **Returns** | `{ error: NextResponse \| null, userId: string \| null }` |
| **Used by** | `/api/tools/billing/lookup`, `/api/tools/faq/search` |

**Behavior:** Checks Clerk `userId`. Returns `401 { error: "Unauthorized" }` if missing.

### `requireTenantContext()`

| | |
|---|---|
| **File** | `lib/api/tenant-context.ts` |
| **Helpers used** | `createDataLoaders` from `@/server/graphql/dataloaders`, `isAppError` from `@/server/lib/errors`, `prisma` from `@/server/lib/prisma`, `TenantRepository` from `@/server/repositories/tenant.repository`, `syncTenantFromClerk` from `@/server/services/clerk-provision.service`, `tenantService` from `@/server/services/tenant.service` |
| **Returns** | `{ error: NextResponse \| null, ctx: TenantContext \| null }` |
| **Used by** | Most REST routes and indirectly by GraphQL via `createGraphQLContext()` |

**Behavior:** Resolves the signed-in user to a company (tenant), membership, role, and permissions. Returns `401 { error: "Unauthorized" }` if no tenant can be resolved.

### `delay(ms)`

| | |
|---|---|
| **File** | `lib/api/auth.ts` |
| **Purpose** | Artificial latency for connect/sync/test UX |
| **Used by** | Integration connect, sheets sync, agent tool health check |

### `isAppError(error)`

| | |
|---|---|
| **File** | `src/server/lib/errors.ts` |
| **Error classes** | `AppError`, `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404) |

### GraphQL error mapping

| | |
|---|---|
| **File** | `src/server/graphql/map-error.ts` |
| **Function** | `maskGraphQLError`, `toGraphQLError` |
| **Behavior** | Maps `AppError` → GraphQL error with `extensions.code` and HTTP status; Prisma errors → `503 SERVICE_UNAVAILABLE` in production |

---

## GraphQL API — `/api/graphql`

| | |
|---|---|
| **Route file** | `app/api/graphql/route.ts` |
| **Handler** | GraphQL Yoga (`src/server/graphql/yoga.ts`) |
| **Schema** | `src/server/graphql/schema/*.graphql` (merged in `src/server/graphql/type-defs.generated.ts`) |
| **Resolvers** | `src/server/resolvers/index.ts` |
| **Context** | `createGraphQLContext()` from `src/server/graphql/context.ts` |
| **Methods** | `GET`, `POST`, `OPTIONS` |
| **Runtime** | `nodejs`, `maxDuration: 60` |

### How it is used

| Caller | File | When |
|--------|------|------|
| Browser client | `lib/graphql/client.ts` → `gqlRequest()` | Mutations and some direct reads (phone numbers list, agent create/update) |
| Page cache loaders | `src/server/page-cache/execute-graphql.ts` | Server-side GraphQL during page-cache refresh |
| Dev landing page | GraphQL Yoga (dev only) | Interactive schema explorer at `/api/graphql` |

### Request format

```http
POST /api/graphql
Content-Type: application/json
Cookie: <Clerk session>

{
  "query": "<GraphQL document>",
  "variables": { ... }
}
```

### Success response

```json
{
  "data": { ... }
}
```

### Error scenarios

| Condition | HTTP | GraphQL `extensions.code` | Message |
|-----------|------|---------------------------|---------|
| No Clerk session | 401 | `UNAUTHORIZED` | `Unauthorized` or `Organization context required` |
| Missing permission | 403 | `FORBIDDEN` | `Missing permission: <permission>` or `Not a member of this organization` |
| Resource not found | 404 | `NOT_FOUND` | e.g. `Agent not found`, `Call log not found` |
| Database failure | 503 | `SERVICE_UNAVAILABLE` | `Database temporarily unavailable` (prod) |
| Unhandled error | 500 | `INTERNAL_SERVER_ERROR` | `Internal server error` (prod) |

---

### Queries

#### `viewer`

| | |
|---|---|
| **Resolver** | `tenantService.getViewer(ctx)` — `src/server/services/tenant.service.ts` |
| **When called** | Home, settings, and setup page loads (via page cache) |
| **Response** | `{ id, email, firstName, lastName, role, company { id, name, slug } }` |

#### `credits.summary`

| | |
|---|---|
| **Service** | `creditsService.getSummary(ctx)` — `src/server/services/credits.service.ts` |
| **When called** | Home dashboard, billing page |
| **Response** | `{ remaining, used, total, availablePercent, renewalAt, planId }` |

#### `credits.usageHistory(first, after)`

| | |
|---|---|
| **Service** | `creditsService.getUsageHistory(ctx, args)` |
| **When called** | Billing page (purchase history) |
| **Response** | Relay connection of `CreditUsage` edges |

#### `billing.subscription`

| | |
|---|---|
| **Service** | `billingService.getSubscription(ctx)` — `src/server/services/billing.service.ts` |
| **When called** | Billing page load |
| **Response** | `BillingSubscription` or `null` |

#### `billing.invoices(first, after)`

| | |
|---|---|
| **Service** | `billingService.getInvoices(ctx, args)` |
| **When called** | Billing page load |
| **Response** | Relay connection of `BillingInvoice` edges |

#### `callLogs.recent(limit)`

| | |
|---|---|
| **Service** | `callLogsService.getRecent(ctx, limit)` — `src/server/services/call-logs.service.ts` |
| **When called** | Home dashboard |
| **Response** | `[CallLog!]!` |

#### `callLogs.connection(first, after, filter)`

| | |
|---|---|
| **Service** | `callLogsService.getConnection(ctx, ...)` |
| **Filter parser** | `parseCallLogFilter()` in `src/server/resolvers/index.ts` |
| **When called** | Call logs page, agent detail, phone detail (with filters) |
| **Filter fields** | `direction`, `status`, `aiAgentId`, `phoneNumberId`, `assignedUserId`, `dateFrom`, `dateTo`, `search` |
| **Response** | Relay connection of `CallLog` edges |

#### `callLogs.detail(id)`

| | |
|---|---|
| **Service** | `callLogsService.getDetail(ctx, id)` |
| **When called** | Call detail page |
| **Errors** | `404 Not found` — `Call log not found` |
| **Response** | `CallLogDetail` with transcript |

#### `analytics.summary(granularity)`

| | |
|---|---|
| **Service** | `analyticsService.getSummary(ctx, granularity)` — `src/server/services/analytics.service.ts` |
| **When called** | Home dashboard |
| **Response** | `{ totalCalls, connectedCalls, conversionRate, generatedLeads, periodStart, periodEnd }` |

#### `agents.statusSummary` / `agents.list` / `agents.byId(id)`

| | |
|---|---|
| **Service** | `agentsService` — `src/server/services/agents.service.ts` |
| **When called** | Agents page, agent detail, create-agent flow |
| **Errors** | `404` on `byId` if agent missing or wrong tenant |
| **Response** | `AgentStatusSummary`, `[AiAgent!]!`, or `AiAgent` |

#### `agentLibrary.list` / `agentLibrary.bySlug(slug)`

| | |
|---|---|
| **Service** | `agentLibraryService` — `src/server/services/agent-library.service.ts` |
| **When called** | Agent library and deploy-template pages |
| **Errors** | `404 Library agent not found` on `bySlug` |
| **Response** | `[AgentLibraryEntry!]!` or `AgentLibraryEntry` |

#### `phoneNumbers.list` / `phoneNumbers.byId(id)`

| | |
|---|---|
| **Service** | `phoneNumbersService` — `src/server/services/phone-numbers.service.ts` |
| **When called** | Phone numbers page, phone detail, agent detail |
| **Errors** | `404 Phone number not found` |
| **Response** | `[PhoneNumber!]!` or `PhoneNumber` |

#### `uploadedContacts.list`

| | |
|---|---|
| **Service** | `uploadedContactsService.list(ctx)` — `src/server/services/uploaded-contacts.service.ts` |
| **When called** | Contact phones page |
| **Response** | `[UploadedContact!]!` |

#### `leads.connection(first, after, filter)` / `leads.byId` / `leads.temperatureBreakdown`

| | |
|---|---|
| **Service** | `leadsService` — `src/server/services/leads.service.ts` |
| **When called** | Lead reactivation page |
| **Filter fields** | `dormantOnly`, `minDaysInactive`, `temperature` |
| **Errors** | `404 Lead not found` on `byId` |

#### `campaigns.list`

| | |
|---|---|
| **Service** | `campaignsService.list(ctx)` — `src/server/services/campaigns.service.ts` |
| **When called** | Home dashboard |

#### `notifications.list(first, after)`

| | |
|---|---|
| **Service** | `notificationsService.list(ctx, args)` — `src/server/services/notifications.service.ts` |
| **When called** | Settings page |

#### `integrations.list`

| | |
|---|---|
| **Service** | `integrationsService.list(ctx)` — `src/server/services/notifications.service.ts` |
| **When called** | Setup page |

#### `scheduler.upcoming(limit)`

| | |
|---|---|
| **Service** | `schedulerService.listUpcoming(ctx, limit)` |
| **When called** | Home dashboard |

#### `events.recent(limit)`

| | |
|---|---|
| **Service** | `eventsService.listRecent(ctx, limit)` — `src/server/services/events.service.ts` |
| **When called** | Home dashboard |

---

### Mutations

All mutations are invoked via `lib/graphql/api.ts` → `gqlRequest()` from client components or hooks.

#### `credits.adjustCredits(amount, description)`

| | |
|---|---|
| **Service** | `creditsService.adjustCredits(ctx, amount, description)` |
| **Client** | Admin/billing flows (if exposed in UI) |
| **Response** | `CreditUsage` |
| **Errors** | Permission / validation errors via service layer |

#### `callLogs.recordCallCompleted(callLogId, creditsUsed)`

| | |
|---|---|
| **Service** | `creditsService.debitForCall` + `callLogsService.onCallCompleted` |
| **When called** | Post-call credit debit (internal / telephony integration) |
| **Response** | `Boolean!` (`true`) |

#### `agents.create(input)` / `agents.update(id, input)`

| | |
|---|---|
| **Service** | `agentsService.create` / `agentsService.update` |
| **Client** | `hooks/use-agents-graphql.ts` → `createAgentOnServer`, `updateAgentOnServer` |
| **When called** | Create agent page, agent detail edits |
| **Input** | `CreateAgentInput` / `UpdateAgentInput` (see `domains.graphql`) |
| **Errors** | `404 Agent not found` on update |

#### `phoneNumbers.create(input)` / `phoneNumbers.update(id, input)`

| | |
|---|---|
| **Service** | `phoneNumbersService` |
| **Client** | `hooks/use-phone-numbers-graphql.ts`, `hooks/use-phone-number-detail-graphql.ts` |
| **When called** | Phone numbers management |
| **Errors** | `404 Phone number not found` on update |

#### `uploadedContacts.create(phone)`

| | |
|---|---|
| **Service** | `uploadedContactsService.create(ctx, phone)` |
| **Client** | `lib/graphql/api.ts` → `createUploadedContact` |
| **When called** | Manual single-phone add on contact phones page |
| **Response** | `UploadedContact` |

#### `uploadedContacts.importPhones(phones)`

| | |
|---|---|
| **Service** | `uploadedContactsService.importPhones(ctx, phones)` |
| **Client** | `lib/graphql/api.ts` → `importUploadedContacts` |
| **When called** | After file upload parsing on contact phones page |
| **Response** | `{ created, skipped, invalid }` |

#### `uploadedContacts.delete(id)` / `uploadedContacts.bulkDelete(ids)`

| | |
|---|---|
| **Service** | `uploadedContactsService.delete` / `bulkDelete` |
| **Client** | Contact phones page |
| **Errors** | `404 Contact not found` on single delete |
| **Response** | `Boolean!` / `Int!` (count deleted) |

#### `leads.importRows(rows)`

| | |
|---|---|
| **Service** | `leadsService.importRows(ctx, rows)` |
| **Client** | `lib/graphql/api.ts` → `importLeads` |
| **When called** | Lead reactivation CSV import |
| **Response** | `{ hot, warm, cold, total, invalid, created, updated }` |

---

## Page Cache API — `/api/page-cache/[pageKey]`

| | |
|---|---|
| **Route file** | `app/api/page-cache/[pageKey]/route.ts` |
| **Method** | `GET` |
| **Auth** | `createGraphQLContext()` (same tenant resolution as GraphQL) |

### Helper functions

| Function | Import path | Role |
|----------|-------------|------|
| `isValidPageCacheKey` | `@/server/page-cache/registry` | Validates `pageKey` |
| `getPageLoader` | `@/server/page-cache/registry` | Returns loader for key |
| `parsePageCacheParams` | `@/server/page-cache/parse-params` | Parses `?id`, `?slug`, `?after`, `?filter` |
| `cacheKeys.page` | `@/server/cache/keys` | Builds Redis cache key |
| `pageCacheService.getPageData` | `@/server/cache/page-cache.service` | Redis get/set with stale-while-revalidate |
| `createGraphQLContext` | `@/server/graphql/context` | Tenant context |
| `isAppError` | `@/server/lib/errors` | Error → HTTP status mapping |

### Query parameters

| Param | Type | Used by |
|-------|------|---------|
| `id` | string | `call-detail`, `agent-detail`, `phone-detail` |
| `slug` | string | `agent-template` |
| `after` | string | Cursor pagination (`billing`, `call-logs`, `lead-reactivation`) |
| `filter` | JSON string | `call-logs`, `lead-reactivation` |

### Valid `pageKey` values

| pageKey | Loader | GraphQL query | Client hook |
|---------|--------|---------------|-------------|
| `home` | `loadHomePage` | `HOME_PAGE_QUERY` | `use-home-dashboard-graphql.ts` |
| `billing` | `loadBillingPage` | `BILLING_PAGE_QUERY` | `use-billing-graphql.ts` |
| `call-logs` | `loadCallLogsPage` | `CALL_LOGS_PAGE_QUERY` | `use-call-logs-graphql.ts` |
| `call-detail` | `loadCallDetailPage` | `CALL_DETAIL_QUERY` | `use-call-detail-graphql.ts` |
| `agents` | `loadAgentsPage` | `AGENTS_LIST_QUERY` | `use-agents-graphql.ts` |
| `agent-detail` | `loadAgentDetailPage` | `AGENT_DETAIL_PAGE_QUERY` | `use-agent-detail-graphql.ts` |
| `agent-library` | `loadAgentLibraryPage` | `AGENT_LIBRARY_LIST_QUERY` | `use-agent-library-graphql.ts` |
| `agent-template` | `loadAgentTemplatePage` | `AGENT_LIBRARY_BY_SLUG_QUERY` | `use-agent-library-graphql.ts` |
| `lead-reactivation` | `loadLeadReactivationPage` | `LEADS_REACTIVATION_QUERY` | `use-lead-reactivation-graphql.ts` |
| `setup` | `loadSetupPage` | `SETUP_PAGE_QUERY` | `use-setup-graphql.ts` |
| `settings` | `loadSettingsPage` | `SETTINGS_PAGE_QUERY` | `use-settings-graphql.ts` |
| `phone-detail` | `loadPhoneDetailPage` | `PHONE_NUMBER_DETAIL_QUERY` | `use-phone-number-detail-graphql.ts` |
| `phone-contacts` | `loadPhoneContactsPage` | `UPLOADED_CONTACTS_LIST_QUERY` | `use-contact-phones-graphql.ts` |

Loaders live in `src/server/page-cache/loaders/index.ts` and call `executeGraphQLFromRequest()` from `src/server/page-cache/execute-graphql.ts`.

### When called

- On dashboard page mount via `useCachedPagePoll` (`hooks/use-cached-page-poll.ts`)
- Polls every **10 seconds** (silent refresh) while page is visible
- Client entry: `fetchCachedPage()` in `lib/page-cache/client.ts`

### Success response

```json
{
  "data": { ... },
  "cachedAt": 1719158400000,
  "fromCache": true
}
```

| Field | Description |
|-------|-------------|
| `data` | GraphQL query result for the page |
| `cachedAt` | Unix ms when data was cached |
| `fromCache` | `true` if served from Redis within stale window (10s default) |

### Error scenarios

| Status | Body | Cause |
|--------|------|-------|
| `404` | `{ "error": "Unknown page key" }` | Invalid `pageKey` |
| `404` | `{ "error": "Page loader not found" }` | Registry miss (should not happen if key valid) |
| `401` | `{ "error": "Unauthorized" }` | No Clerk session / no tenant |
| `403` | `{ "error": "..." }` | Forbidden via `AppError` |
| `500` | `{ "error": "Failed to load page cache" }` | Unhandled exception or missing required `id` in loader |

---

## Clerk Webhook — `/api/webhooks/clerk`

| | |
|---|---|
| **Route file** | `app/api/webhooks/clerk/route.ts` |
| **Method** | `POST` |
| **Auth** | Svix signature verification (`svix` package) |
| **Public** | Yes — excluded from Clerk middleware in `proxy.ts` |

### Helper functions

| Function | Import path | Role |
|----------|-------------|------|
| `isClerkWebhooksEnabled` | `@/server/lib/clerk-config` | Checks `CLERK_WEBHOOKS_ENABLED === "true"` |
| `handleClerkWebhookEvent` | `@/server/services/clerk-provision.service` | Syncs users, orgs, memberships to Prisma |
| `cacheService.invalidateUserPermissions` | `@/server/cache/cache.service` | Clears permission cache on membership changes |

### When called

- Clerk sends webhook events on user/org lifecycle changes (production when webhooks enabled)
- Local dev typically uses direct API provisioning instead (`isClerkWebhooksEnabled()` returns false)

### Handled event types

| Event | Action |
|-------|--------|
| `user.created` / `user.updated` | Upsert user in DB |
| `organization.created` / `organization.updated` | Upsert company |
| `organizationMembership.created` / `.updated` / `.deleted` | Sync membership + invalidate permission cache |

### Success responses

**Webhooks disabled (dev):**
```json
{ "received": true, "skipped": true, "reason": "Clerk webhooks disabled; use direct API provisioning in dev" }
```

**Success:**
```json
{ "received": true }
```

### Error scenarios

| Status | Body | Cause |
|--------|------|-------|
| `500` | `{ "error": "CLERK_WEBHOOKS_ENABLED is true but CLERK_WEBHOOK_SECRET is missing" }` | Misconfiguration |
| `400` | `{ "error": "Missing svix headers" }` | Missing `svix-id`, `svix-timestamp`, or `svix-signature` |
| `400` | `{ "error": "Invalid signature" }` | Svix verification failed |
| `500` | `{ "error": "Webhook handler failed" }` | `handleClerkWebhookEvent` threw |

---

## Integrations REST APIs

All integration routes use `requireTenantContext()` from `lib/api/tenant-context.ts` and delegate to `lib/integrations/db-state.ts` (which uses `integrationsManagementService` from `src/server/services/integrations-management.service.ts` and Prisma).

**Primary client:** `stores/integrations-store.ts` → `components/integrations/*`

---

### `GET /api/integrations`

| | |
|---|---|
| **Route** | `app/api/integrations/route.ts` |
| **Helper** | `listIntegrations(ctx)` — `lib/integrations/db-state.ts` |
| **When called** | Integrations section mount (`fetchIntegrations`) |

**Success `200`:**
```json
{ "integrations": [ WorkspaceIntegration, ... ] }
```

**Errors:** `401 Unauthorized`

---

### `GET /api/integrations/[id]`

| | |
|---|---|
| **Route** | `app/api/integrations/[id]/route.ts` |
| **Helper** | `getIntegrationById(ctx, id)` — `lib/integrations/db-state.ts` |
| **When called** | Not currently called from frontend (available for direct fetch) |

**Success `200`:**
```json
{ "integration": WorkspaceIntegration }
```

**Errors:**

| Status | Body |
|--------|------|
| `401` | `{ "error": "Unauthorized" }` |
| `404` | `{ "error": "Integration not found" }` |

---

### `POST /api/integrations/[id]/connect`

| | |
|---|---|
| **Route** | `app/api/integrations/[id]/connect/route.ts` |
| **Helpers** | `delay(1500)` — `lib/api/auth.ts`; `connectIntegrationDb(ctx, id)` — `lib/integrations/db-state.ts` |
| **When called** | User clicks Connect on integration card |

**Success `200`:**
```json
{ "integration": WorkspaceIntegration }
```

**Errors:** `401`, `404 Integration not found`

---

### `POST /api/integrations/[id]/disconnect`

| | |
|---|---|
| **Route** | `app/api/integrations/[id]/disconnect/route.ts` |
| **Helper** | `disconnectIntegrationDb(ctx, id)` — `lib/integrations/db-state.ts` |
| **When called** | User confirms disconnect |

**Success `200`:**
```json
{ "integration": WorkspaceIntegration }
```

**Errors:** `401`, `404 Integration not found`

---

### `PUT /api/integrations/google/sheets/config`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/config/route.ts` |
| **Helper** | `updateSheetsConfigDb(ctx, config)` — `lib/integrations/db-state.ts` |
| **When called** | Save Google Sheets mapping in detail panel |

**Request body:** `Partial<GoogleSheetsConfig>` — `lib/integrations/types.ts`

**Success `200`:**
```json
{ "integration": WorkspaceIntegration }
```

**Errors:** `401`, `404 Integration not found`

---

### `POST /api/integrations/google/sheets/sync`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/sync/route.ts` |
| **Helpers** | `triggerSheetsSyncDb`, `completeSheetsSyncDb`, `delay(2000)` |
| **When called** | User clicks Sync in Google Sheets panel |

**Success `200`:**
```json
{ "integration": WorkspaceIntegration }
```

**Errors:** `401`

---

### `GET /api/integrations/google/sheets/sync-history`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/sync-history/route.ts` |
| **Helper** | `getSyncHistoryDb(ctx)` — `lib/integrations/db-state.ts` |
| **When called** | Google Sheets detail panel open / after sync |

**Success `200`:**
```json
{ "history": [ SyncHistoryEntry, ... ] }
```

---

### `GET /api/integrations/google/sheets/spreadsheets`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/spreadsheets/route.ts` |
| **Helper** | `getSpreadsheetsDb(ctx)` |
| **When called** | Sheets config panel load |

**Success `200`:**
```json
{ "spreadsheets": [ { "id", "name", "modifiedAt", "webViewLink" }, ... ] }
```

---

### `POST /api/integrations/google/sheets/spreadsheets`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/spreadsheets/route.ts` |
| **Helper** | `createSpreadsheetDb(ctx, name, columns)` — uses Google `spreadsheets.create` + `values.update` |
| **When called** | User creates a new spreadsheet from UI (column-first flow) |

**Request body:**
```json
{
  "name": "PropNex Leads",
  "columns": [
    { "propnexField": "customerName", "label": "Customer Name", "spreadsheetColumn": "" },
    { "propnexField": "phoneNumber", "label": "Phone Number", "spreadsheetColumn": "" }
  ]
}
```

**Success `200`:**
```json
{ "spreadsheet": { "id", "name", "modifiedAt", "webViewLink" } }
```

---

### `GET /api/integrations/google/sheets/headers?spreadsheetId=&worksheetName=`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/headers/route.ts` |
| **Helper** | `getSheetHeaders(ctx, spreadsheetId, worksheetName)` — Google `spreadsheets.values.get` |
| **When called** | Column mapping editor loads real header row |

**Success `200`:**
```json
{ "headers": ["Customer Name", "Phone Number", ...] }
```

---

### Google OAuth routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/integrations/google/oauth/start?integrationId=google-sheets` | Redirect to Google consent (scopes: spreadsheets, drive.file, calendar) |
| `GET` | `/api/integrations/google/oauth/callback` | Exchange code, store encrypted tokens, redirect to `/settings?tab=integrations` |

**Env vars:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_TOKEN_ENCRYPTION_KEY`

---

### Google Sheets REST APIs (used internally)

| API | Method | Required inputs | Body / query |
|-----|--------|-----------------|--------------|
| `spreadsheets.create` | POST | — | `{ properties: { title }, sheets: [{ properties: { title } }] }` |
| `spreadsheets.values.update` | PUT | `spreadsheetId`, `range`, `valueInputOption` | `{ values: string[][] }` |
| `spreadsheets.values.append` | POST | `spreadsheetId`, `range`, `valueInputOption` | `{ values: string[][] }` |
| `spreadsheets.values.batchUpdate` | POST | `spreadsheetId` | `{ valueInputOption, data: [{ range, values }] }` |
| `spreadsheets.values.get` | GET | `spreadsheetId`, `range` | — |
| `drive.files.list` | GET | `q`, `fields` | — |

---

### `POST /api/integrations/google/sheets/spreadsheets/create`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/spreadsheets/create/route.ts` |
| **Helper** | `createSpreadsheetDb(ctx, name)` |
| **Note** | Duplicate of POST on `/spreadsheets`; store uses `/spreadsheets` not `/create` |

---

### `GET /api/integrations/google/sheets/worksheets?spreadsheetId=`

| | |
|---|---|
| **Route** | `app/api/integrations/google/sheets/worksheets/route.ts` |
| **Helper** | `getWorksheetsDb(ctx, spreadsheetId)` |
| **When called** | After spreadsheet selection in sheets config |

**Success `200`:**
```json
{ "worksheets": [ { "id", "name", "rowCount" }, ... ] }
```

**Errors:**

| Status | Body |
|--------|------|
| `400` | `{ "error": "spreadsheetId required" }` |
| `401` | Unauthorized |

---

### `PUT /api/integrations/google/calendar/config`

| | |
|---|---|
| **Route** | `app/api/integrations/google/calendar/config/route.ts` |
| **Helpers** | `updateCalendarConfigDb(ctx, config)`; `DEFAULT_WORKING_HOURS` — `lib/integrations/types.ts` |
| **When called** | Save calendar settings in Google Calendar panel |

**Request body:** `Partial<GoogleCalendarConfig>`

**Success `200`:**
```json
{ "integration": WorkspaceIntegration }
```

**Errors:** `401`, `404 Integration not found`

---

### `GET /api/integrations/google/calendar/calendars`

| | |
|---|---|
| **Route** | `app/api/integrations/google/calendar/calendars/route.ts` |
| **Helper** | `getCalendarsDb(ctx)` |
| **When called** | Calendar config panel load |

**Success `200`:**
```json
{ "calendars": [ CalendarOption, ... ] }
```

---

## Agent Tools REST APIs

**Client:** `stores/agent-tools-store.ts` → `components/agents/detail/agent-tools-section.tsx`

---

### `GET /api/agents/[agentId]/tools`

| | |
|---|---|
| **Route** | `app/api/agents/[agentId]/tools/route.ts` |
| **Helper** | `getAgentToolsDb(ctx, agentId)` — `lib/integrations/db-state.ts` |
| **When called** | Agent detail page mount |

**Success `200`:**
```json
{ "tools": [ AgentToolAssignment, ... ] }
```

Each tool: `faq`, `billing`, `google-calendar`, `google-sheets` (see `lib/tools/types.ts`).

**Errors:** `401`

---

### `PUT /api/agents/[agentId]/tools/[toolId]`

| | |
|---|---|
| **Route** | `app/api/agents/[agentId]/tools/[toolId]/route.ts` |
| **Helper** | `updateAgentToolDb(ctx, agentId, toolId, patch)` — `lib/integrations/db-state.ts` |
| **When called** | Toggle tool on/off, save tool configuration |

**Request body:** `Partial<AgentToolAssignment>` (e.g. `{ "enabled": true }`, config fields)

**Success `200`:**
```json
{ "tool": AgentToolAssignment }
```

**Errors:** `401`, `404 Agent not found` (from service layer)

---

### `POST /api/agents/[agentId]/tools/[toolId]`

| | |
|---|---|
| **Route** | `app/api/agents/[agentId]/tools/[toolId]/route.ts` |
| **Helpers** | `delay(800)`, `updateAgentToolDb` with health/usage reset |
| **When called** | User runs tool health check |

**Success `200`:**
```json
{
  "tool": AgentToolAssignment,
  "testResult": "passed"
}
```

---

## Contact Phones REST API

### `POST /api/contact-phones/parse-upload`

| | |
|---|---|
| **Route** | `app/api/contact-phones/parse-upload/route.ts` |
| **Auth** | `requireTenantContext()` |
| **When called** | Non-CSV file upload (Excel, PDF, Word) on contact phones page |

### Helper functions

| Function | Import path | Role |
|----------|-------------|------|
| `parseContactPhoneUpload` | `lib/contact-phone-file-parser.ts` | Parses buffer by extension |
| `SERVER_PARSE_EXTENSIONS` | `lib/contact-phone-file-parser.ts` | `.xlsx`, `.xls`, `.pdf`, `.docx` |
| `getContactPhoneUploadExtension` | `lib/contact-phone-import.ts` | Extract extension from filename |
| `normalizeContactPhone` | `lib/contact-phone-validation.ts` | 10-digit phone normalization |

**Caller chain:**
1. `components/contact-phones/upload-contact-phones-section.tsx`
2. → `parsePhonesFromUploadFile()` in `lib/contact-phone-import.ts`
3. → `fetch("/api/contact-phones/parse-upload")` for non-CSV files
4. → Parsed phones imported via GraphQL `uploadedContacts.importPhones`

### Request

```http
POST /api/contact-phones/parse-upload
Content-Type: multipart/form-data

file=<File>
```

| Constraint | Value |
|------------|-------|
| Max size | 50 MB |
| Allowed types | `.xlsx`, `.xls`, `.pdf`, `.docx` |

### Success `200`

```json
{
  "phones": ["9876543210", ...],
  "invalid": 3
}
```

Phones are deduplicated 10-digit strings.

### Error scenarios

| Status | Body | Cause |
|--------|------|-------|
| `401` | `{ "error": "Unauthorized" }` | Not signed in |
| `400` | `{ "error": "Invalid upload payload." }` | Malformed form data |
| `400` | `{ "error": "A file is required." }` | Missing `file` field |
| `400` | `{ "error": "Unsupported file type..." }` | Wrong extension |
| `400` | `{ "error": "File exceeds the 50 MB limit." }` | Too large |
| `400` | `{ "error": "No phone numbers found..." }` | Empty parse result |
| `400` | `{ "error": "No valid phone numbers found..." }` | All numbers invalid |
| `400` | `{ "error": "<parse message>" }` | Parser exception |

---

## Voice Agent Runtime Tool APIs

These endpoints are designed for **voice agent tool execution** during live calls. They are not referenced from dashboard React code; agents invoke them via configured `serverConfig` URLs.

All use Clerk session auth (`requireAuth` or `requireTenantContext`).

---

### `POST /api/tools/billing/lookup`

| | |
|---|---|
| **Route** | `app/api/tools/billing/lookup/route.ts` |
| **Auth** | `requireAuth()` — `lib/api/auth.ts` |
| **Data** | `billingSummary` — `lib/billing-data.ts` (static mock data) |

**Request body:**
```json
{
  "permissions": {
    "creditAccess": true,
    "planAccess": true,
    "invoiceAccess": true
  }
}
```

**Success `200`:** Subset based on permissions:
```json
{
  "credits": { "remaining": 12450, "total": 16000, "used": 3550 },
  "plan": { "name": "Growth", "resetDate": "2026-07-01" },
  "invoice": { "nextAmount": 299, "dueDate": "2026-07-15", "status": "paid" }
}
```

**Errors:** `401 Unauthorized`

---

### `POST /api/tools/faq/search`

| | |
|---|---|
| **Route** | `app/api/tools/faq/search/route.ts` |
| **Auth** | `requireAuth()` |

**Request body:**
```json
{ "query": "pricing plans", "agentId": "optional" }
```

**Success `200`:**
```json
{
  "answer": "...",
  "confidence": 0.92,
  "sources": ["Product FAQ"]
}
```

Keyword matching against built-in FAQ map (pricing, company, product).

**Errors:** `401 Unauthorized`

---

### `POST /api/tools/google-calendar/availability`

| | |
|---|---|
| **Route** | `app/api/tools/google-calendar/availability/route.ts` |
| **Auth** | `requireTenantContext()` |
| **Helper** | `getCalendarConfigDb(ctx)` — `lib/integrations/db-state.ts` |

**Success `200`:**
```json
{
  "available": true,
  "timezone": "Asia/Kolkata",
  "workingHours": { ... },
  "meetingDurationMinutes": 30,
  "bufferMinutes": 15
}
```

**Errors:** `401`

---

### `POST /api/tools/google-calendar/events`

| | |
|---|---|
| **Route** | `app/api/tools/google-calendar/events/route.ts` |
| **Auth** | `requireTenantContext()` |
| **Helpers** | `getCalendarEventsDb`, `addCalendarEventDb`, `updateCalendarEventDb`, `deleteCalendarEventDb` — `lib/integrations/db-state.ts` |

**Request body:**
```json
{
  "action": "list" | "create" | "reschedule" | "cancel",
  "eventId": "required for reschedule/cancel",
  "title": "optional",
  "start": "ISO datetime",
  "end": "ISO datetime",
  "attendeeEmail": "optional"
}
```

| Action | Success response |
|--------|------------------|
| `list` | `{ "events": [...] }` |
| `create` | `{ "event": {...} }` |
| `reschedule` | `{ "event": {...} }` |
| `cancel` | `{ "success": true }` |

**Errors:**

| Status | Body |
|--------|------|
| `400` | `{ "error": "eventId required" }` |
| `400` | `{ "error": "Invalid action" }` |
| `404` | `{ "error": "Event not found" }` |
| `401` | Unauthorized |

---

### `POST /api/tools/google-sheets/execute`

| | |
|---|---|
| **Route** | `app/api/tools/google-sheets/execute/route.ts` |
| **Auth** | `requireTenantContext()` |
| **Helpers** | `readSheetRowDb`, `writeSheetRowDb` — `lib/integrations/db-state.ts` |

**Request body:**
```json
{
  "action": "read" | "write" | "append" | "update",
  "rowIndex": 0,
  "data": { "customerName": "...", "phoneNumber": "..." }
}
```

| Action | Required fields | Success response |
|--------|-----------------|------------------|
| `read` | `rowIndex` | `{ "row": SheetRow }` — uses `values.get` |
| `append` | `data` | `{ "row": SheetRow }` — uses `values.append` |
| `write` / `update` | `rowIndex`, `data` | `{ "row": SheetRow }` — uses `values.update` |

**Errors:**

| Status | Body |
|--------|------|
| `400` | `{ "error": "Invalid action" }` |
| `401` | Unauthorized |

---

## Agent Server Internal APIs

Called by **propnex-agent-server** after `POST /api/v1/calls/complete`. Uses shared-secret auth (no Clerk session).

**Env vars:** `AGENT_SERVER_API_KEY` (must match agent-server `AGENT_SERVER_API_KEY`)

---

### `POST /api/internal/dialer/sheets-sync`

| | |
|---|---|
| **Route** | `app/api/internal/dialer/sheets-sync/route.ts` |
| **Auth** | `X-Agent-Server-Key` + `X-Company-Id` — `lib/api/agent-server-auth.ts` |
| **Helper** | `syncDialerCallToSheetDb(ctx, callId)` — `lib/integrations/db-state.ts` |
| **When called** | Agent-server `GoogleSheetUpdateStrategy` after call complete when Google Sheets integration is `CONNECTED` |

**Request headers:**

| Header | Required | Value |
|--------|----------|-------|
| `X-Agent-Server-Key` | Yes | `AGENT_SERVER_API_KEY` |
| `X-Company-Id` | Yes | MongoDB company id |
| `Content-Type` | Yes | `application/json` |

**Request body:**
```json
{ "callId": "<dialerCallId>" }
```

**Success `200` (synced):**
```json
{ "success": true, "spreadsheetId": "...", "rowsAppended": 1 }
```

**Success `200` (skipped — not an error):**
```json
{ "skipped": true, "reason": "Column mappings are not configured" }
```

**Errors:**

| Status | Body |
|--------|------|
| `400` | `{ "error": "callId is required" }` or missing `X-Company-Id` |
| `401` | `{ "error": "Unauthorized" }` |
| `503` | `{ "error": "Agent server API key is not configured" }` |
| `500` | `{ "error": "..." }` — Google API or missing dialer call |

**Row mapping:** `mapDialerCallToRow()` fills each configured `columnMappings` field from lead + `DialerCall` + `CallAnalysis`. `callOutcome` = `{callStatus} — {intent}`; `aiSummary` = call summary.

---

## Client Call Matrix

Quick reference: which frontend code calls which API.

| API | Called from | Trigger |
|-----|-------------|---------|
| `GET /api/page-cache/*` | `lib/page-cache/client.ts` via page hooks | Page mount + 10s poll |
| `POST /api/graphql` | `lib/graphql/client.ts`, page-cache loaders | Mutations, some direct reads |
| `GET /api/integrations` | `stores/integrations-store.ts` | Integrations page load |
| `POST /api/integrations/:id/connect` | `stores/integrations-store.ts` | Connect button |
| `POST /api/integrations/:id/disconnect` | `stores/integrations-store.ts` | Disconnect confirm |
| `POST /api/integrations/google/sheets/sync` | `stores/integrations-store.ts` | Sync button |
| `GET/POST /api/integrations/google/sheets/spreadsheets` | `stores/integrations-store.ts` | Sheets config |
| `GET /api/integrations/google/sheets/worksheets` | `stores/integrations-store.ts` | Spreadsheet selected |
| `PUT /api/integrations/google/sheets/config` | `stores/integrations-store.ts` | Save sheets config |
| `GET /api/integrations/google/sheets/sync-history` | `stores/integrations-store.ts` | Sheets panel |
| `GET /api/integrations/google/calendar/calendars` | `stores/integrations-store.ts` | Calendar panel |
| `PUT /api/integrations/google/calendar/config` | `stores/integrations-store.ts` | Save calendar config |
| `GET /api/agents/:id/tools` | `stores/agent-tools-store.ts` | Agent detail mount |
| `PUT/POST /api/agents/:id/tools/:toolId` | `stores/agent-tools-store.ts` | Toggle, config, test |
| `POST /api/contact-phones/parse-upload` | `lib/contact-phone-import.ts` | Excel/PDF/Word upload |
| GraphQL mutations (contacts) | `lib/graphql/api.ts` | Import/delete contacts |
| GraphQL mutations (agents) | `hooks/use-agents-graphql.ts` | Create/update agent |
| GraphQL mutations (phones) | `hooks/use-phone-numbers-graphql.ts` | Create/update phone |
| GraphQL mutations (leads) | `lib/graphql/api.ts` | Lead CSV import |
| `POST /api/webhooks/clerk` | Clerk (external) | User/org lifecycle |
| `/api/tools/*` | Voice agent runtime (external) | During live calls |
| `POST /api/internal/dialer/sheets-sync` | propnex-agent-server (external) | Post-call Google Sheets append |

---

## Environment Variables

| Variable | Affects |
|----------|---------|
| `DATABASE_URL` | All Prisma-backed APIs |
| `CLERK_SECRET_KEY` | Auth on all protected routes |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signature verification |
| `CLERK_WEBHOOKS_ENABLED` | `true` enables webhook processing |
| `REDIS_URL` | Page cache Redis layer (optional; degrades gracefully) |
| `NEXT_PUBLIC_APP_URL` / `VERCEL_URL` | GraphQL client endpoint resolution |
| `AGENT_SERVER_API_KEY` | Internal dialer → sheets sync endpoint |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_TOKEN_ENCRYPTION_KEY` | Google Sheets/Calendar OAuth |

## File Index (Route → Source)

| Route | File |
|-------|------|
| `/api/graphql` | `app/api/graphql/route.ts` |
| `/api/page-cache/[pageKey]` | `app/api/page-cache/[pageKey]/route.ts` |
| `/api/webhooks/clerk` | `app/api/webhooks/clerk/route.ts` |
| `/api/integrations` | `app/api/integrations/route.ts` |
| `/api/integrations/[id]` | `app/api/integrations/[id]/route.ts` |
| `/api/integrations/[id]/connect` | `app/api/integrations/[id]/connect/route.ts` |
| `/api/integrations/[id]/disconnect` | `app/api/integrations/[id]/disconnect/route.ts` |
| `/api/integrations/google/sheets/config` | `app/api/integrations/google/sheets/config/route.ts` |
| `/api/integrations/google/sheets/sync` | `app/api/integrations/google/sheets/sync/route.ts` |
| `/api/integrations/google/sheets/sync-history` | `app/api/integrations/google/sheets/sync-history/route.ts` |
| `/api/integrations/google/sheets/spreadsheets` | `app/api/integrations/google/sheets/spreadsheets/route.ts` |
| `/api/integrations/google/sheets/spreadsheets/create` | `app/api/integrations/google/sheets/spreadsheets/create/route.ts` |
| `/api/integrations/google/sheets/worksheets` | `app/api/integrations/google/sheets/worksheets/route.ts` |
| `/api/integrations/google/calendar/config` | `app/api/integrations/google/calendar/config/route.ts` |
| `/api/integrations/google/calendar/calendars` | `app/api/integrations/google/calendar/calendars/route.ts` |
| `/api/agents/[agentId]/tools` | `app/api/agents/[agentId]/tools/route.ts` |
| `/api/agents/[agentId]/tools/[toolId]` | `app/api/agents/[agentId]/tools/[toolId]/route.ts` |
| `/api/contact-phones/parse-upload` | `app/api/contact-phones/parse-upload/route.ts` |
| `/api/tools/billing/lookup` | `app/api/tools/billing/lookup/route.ts` |
| `/api/tools/faq/search` | `app/api/tools/faq/search/route.ts` |
| `/api/tools/google-calendar/availability` | `app/api/tools/google-calendar/availability/route.ts` |
| `/api/tools/google-calendar/events` | `app/api/tools/google-calendar/events/route.ts` |
| `/api/tools/google-sheets/execute` | `app/api/tools/google-sheets/execute/route.ts` |
