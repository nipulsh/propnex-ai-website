# PropNex AI — `src/` Server Documentation

This document describes the **`src/server`** backend layer: folder structure, architecture, key types, services, repositories, GraphQL stack, caching, and how each file fits together.

**Stack:** GraphQL Yoga, Prisma + MongoDB, Clerk auth, optional Redis cache.

**Companion docs:** [`api.doc.md`](./api.doc.md) (HTTP route handlers), [`lib/`](./lib/) (client helpers, mappers, GraphQL query strings).

**Last updated:** June 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Request Flow](#request-flow)
4. [Types & Permissions](#types--permissions)
5. [Infrastructure (`server/lib`)](#infrastructure-serverlib)
6. [GraphQL Layer (`server/graphql`)](#graphql-layer-servergraphql)
7. [Resolvers (`server/resolvers`)](#resolvers-serverresolvers)
8. [Services (`server/services`)](#services-serverservices)
9. [Repositories (`server/repositories`)](#repositories-serverrepositories)
10. [Cache Layer (`server/cache`)](#cache-layer-servercache)
11. [Page Cache (`server/page-cache`)](#page-cache-serverpage-cache)
12. [Tests (`server/__tests__`)](#tests-server__tests__)
13. [Keywords & Conventions](#keywords--conventions)
14. [Import Map (Quick Reference)](#import-map-quick-reference)

---

## Architecture Overview

The `src/server` directory is the **domain and data layer** for the PropNex dashboard. It sits behind Next.js route handlers in `app/api/**` and is never imported directly by React components (those use `lib/` instead).

```
┌──────────────────────────────────────────────────────────────────────┐
│                         app/api/* (route handlers)                    │
│   /api/graphql  │  /api/page-cache/*  │  /api/integrations/*  │ ...  │
└───────┬─────────────────┬──────────────────────┬─────────────────────┘
        │                 │                      │
        ▼                 ▼                      ▼
┌───────────────┐  ┌──────────────┐    ┌────────────────────────────┐
│ graphql/yoga  │  │ page-cache/  │    │ integrations-management    │
│ + resolvers   │  │ registry     │    │ .service (REST)            │
└───────┬───────┘  └──────┬───────┘    └─────────────┬──────────────┘
        │                 │                          │
        └────────┬────────┴──────────────────────────┘
                 ▼
        ┌─────────────────┐
        │    Services     │  ← business logic, permissions, caching
        └────────┬────────┘
                 ▼
        ┌─────────────────┐
        │  Repositories   │  ← Prisma queries, tenant-scoped by companyId
        └────────┬────────┘
                 ▼
        ┌─────────────────┐
        │ Prisma / MongoDB│
        └─────────────────┘
```

| Layer | Responsibility |
|-------|----------------|
| **GraphQL** | Schema, Yoga server, context, error mapping, DataLoaders |
| **Resolvers** | Thin wiring from GraphQL fields → service methods |
| **Services** | Authorization, orchestration, cache invalidation, DTO mapping |
| **Repositories** | Database access; every query scoped by `companyId` |
| **Cache** | Redis-backed TTL caches for permissions, analytics, page payloads |
| **Page cache** | Server-side GraphQL execution for dashboard pages |

---

## Folder Structure

```
src/
└── server/
    ├── __tests__/              # Node test runner unit tests
    ├── cache/                  # Redis client, keys, cache + page-cache services
    ├── graphql/
    │   ├── schema/             # .graphql SDL files (merged at build)
    │   ├── context.ts          # Auth → TenantContext for each request
    │   ├── dataloaders.ts      # N+1 prevention for leads, agents, phones, users
    │   ├── debug.ts            # GQL trace logging (env-gated)
    │   ├── map-error.ts        # AppError / Prisma → GraphQLError
    │   ├── server.ts           # Executable schema builder
    │   ├── yoga.ts             # GraphQL Yoga instance
    │   ├── type-defs.generated.ts  # Auto-merged SDL (generated)
    │   └── graphql.generated.ts    # Generated TS types (if present)
    ├── lib/                    # Shared server utilities
    ├── page-cache/             # Dashboard page loaders + registry
    ├── repositories/           # Prisma data access (tenant-scoped)
    ├── resolvers/              # GraphQL resolver map + permission guards
    ├── services/               # Business logic layer
    └── types/                  # TenantContext, permissions, shared types
```

**Total:** 62 TypeScript/GraphQL files under `src/server/`.

---

## Request Flow

### GraphQL request (`POST /api/graphql`)

1. **`yoga.ts`** receives the HTTP request.
2. **`createGraphQLContext()`** (`graphql/context.ts`):
   - Reads Clerk `userId` + `orgId` via `auth()`.
   - Resolves `company` via `tenantService.resolveCompany(orgId)` or membership fallback.
   - If no company: `syncTenantFromClerk(userId)` provisions tenant.
   - Builds `TenantContext`: `userId`, `companyId`, `role`, `permissions`, `loaders`.
3. **Resolvers** delegate to **services** with `ctx: TenantContext`.
4. **Services** call `tenantService.requirePermission()` where needed, then **repositories**.
5. Errors bubble through **`map-error.ts`** → masked GraphQL errors.

### Page cache request (`GET /api/page-cache/[pageKey]`)

1. Route handler validates `pageKey` via `isValidPageCacheKey()`.
2. **`pageCacheService.getPageData()`** checks Redis (stale-after 10s window).
3. On miss/stale: **`getPageLoader(pageKey)`** runs the matching loader.
4. Loader calls **`executeGraphQLFromRequest()`** — internal POST to Yoga with forwarded cookies.
5. Response: `{ data, cachedAt, fromCache }`.

### REST integrations / agent tools

Route handlers in `app/api/**` use **`integrationsManagementService`** directly (not GraphQL). Permissions enforced inside the service.

---

## Types & Permissions

### `server/types/context.ts`

| Type | Fields | Purpose |
|------|--------|---------|
| `TenantContext` | `userId`, `clerkUserId`, `companyId`, `role`, `permissions`, `loaders` | Passed to every service/resolver |
| `GraphQLContext` | `TenantContext` + `isAuthenticated` | Yoga context object |

**Keywords:** `TenantContext`, `GraphQLContext`, `companyId`, `loaders`

### `server/types/permissions.ts`

| Export | Description |
|--------|-------------|
| `PERMISSIONS` | String constants: `billing:read`, `agents:write`, `call_logs:read`, etc. |
| `Permission` | Union type of all permission strings |
| `getPermissionsForRole(role)` | Maps `UserRole` → permission array |
| `mergePermissions(role, custom)` | Deduped union of role + custom role permissions |
| `hasPermission(permissions, required)` | Boolean check |

**Role matrix:**

| Role | Access |
|------|--------|
| `OWNER` | All permissions including `settings:write` |
| `ADMIN` | All except `settings:write` |
| `MANAGER` | Read/write agents, calls, leads, scheduler; read billing/credits |
| `AGENT` | Read credits, calls, agents; write leads; read notifications/events |

---

## Infrastructure (`server/lib`)

### `prisma.ts`

| Export | Description |
|--------|-------------|
| `prisma` | Singleton `PrismaClient` with dev query logging |
| `default` | Same instance (default export) |

Uses `getDatabaseUrl()` when `DATABASE_URL` is set. Dev mode stores client on `globalThis` to survive hot reload.

### `database-url.ts`

| Function | Description |
|----------|-------------|
| `getDatabaseUrl()` | Returns `DATABASE_URL` with `serverSelectionTimeoutMS=10000` and `connectTimeoutMS=10000` appended |

Prevents GraphQL context from blocking ~30s on MongoDB connection failures.

### `errors.ts`

| Class / Function | HTTP | Code |
|------------------|------|------|
| `AppError` | configurable | custom |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `isAppError(error)` | type guard | — |

### `pagination.ts`

| Type / Function | Description |
|-----------------|-------------|
| `PageInfo` | `{ hasNextPage, endCursor }` |
| `Connection<T>` | Relay-style `{ edges, pageInfo }` |
| `encodeCursor(startedAt, id)` | Cursor for call logs (time + id) |
| `decodeCursor(cursor)` | Reverse of above |
| `encodeIdCursor(id, createdAt)` | Cursor for id-based pagination |
| `decodeIdCursor(cursor)` | Reverse of above |
| `buildConnection(items, ...)` | Builds paginated connection from array |

### `clerk-sync.ts`

| Function | Description |
|----------|-------------|
| `companySlugFromName(name)` | URL-safe slug with random suffix |
| `localClerkOrganizationId(clerkUserId)` | `local:{userId}` when Clerk Orgs unavailable |
| `mapClerkRoleToUserRole(role)` | `org:admin` → `ADMIN`, etc. |

### `clerk-config.ts`

| Function | Description |
|----------|-------------|
| `isClerkWebhooksEnabled()` | True when `CLERK_WEBHOOK_SECRET` is set |

### `clerk-errors.ts`

| Function | Description |
|----------|-------------|
| `isClerkOrganizationsDisabled(error)` | Detects Clerk org feature disabled |
| `isClerkNotFound(error)` | Detects 404 from Clerk API |

---

## GraphQL Layer (`server/graphql`)

### Schema files (`graphql/schema/`)

| File | Domain |
|------|--------|
| `root.graphql` | Scalars, enums, `Query`/`Mutation` roots, `Viewer`, `Company`, `PageInfo` |
| `domains.graphql` | Agents, phone numbers, uploaded contacts, leads, campaigns |
| `call-logs.graphql` | Call logs, filters, detail, mutations |
| `billing.graphql` | Subscription, invoices |
| `credits.graphql` | Credit balance, usage history, adjustments |
| `agent-library.graphql` | Template library queries |

Merged into `type-defs.generated.ts` at build time.

**Key enums:** `CallDirection`, `CallStatus`, `UserRole`, `AgentStatus`, `IntegrationStatus`, `AnalyticsGranularity`, `SystemEventType`

### `server.ts`

| Export | Description |
|--------|-------------|
| `schema` | `makeExecutableSchema({ typeDefs, resolvers })` |

### `yoga.ts`

| Export | Description |
|--------|-------------|
| `yoga` | `createYoga()` instance |

**Config highlights:**
- Endpoint: `/api/graphql`
- `context`: `createGraphQLContext()`
- `maskedErrors`: uses `maskGraphQLError()`
- Dev: GraphQL landing page + debug plugin

### `context.ts`

| Function | Description |
|----------|-------------|
| `createGraphQLContext()` | Full auth + tenant resolution → `GraphQLContext` |

Resolution order:
1. Clerk `orgId` → company
2. Else: DB user → active membership → company
3. Else: `syncTenantFromClerk(userId)`
4. `tenantService.resolveMembership()` + `getPermissions()`
5. `createDataLoaders(companyId)`

### `dataloaders.ts`

| Function | Returns |
|----------|---------|
| `createDataLoaders(companyId)` | `{ lead, aiAgent, phoneNumber, user }` DataLoaders |

Batch-loads related entities for GraphQL field resolvers (avoids N+1 queries).

### `debug.ts`

| Function | Description |
|----------|-------------|
| `gqlDebug(label, data?)` | Trace log when `GQL_TRACE=1` |
| `gqlLogError(label, error, data?)` | Error log with stack |
| `gqlDebugTimed(label, fn)` | Async timing wrapper |

### `map-error.ts`

| Function | Description |
|----------|-------------|
| `toGraphQLError(error, isDev)` | `AppError` / Prisma → `GraphQLError` with extensions |
| `maskGraphQLError(error, message, isDev)` | Yoga masked error handler |

---

## Resolvers (`server/resolvers`)

### `index.ts`

Central resolver map. Pattern: **namespace resolvers** return `{}` on Query/Mutation roots; nested types hold real logic.

| GraphQL namespace | Service | Key operations |
|-------------------|---------|----------------|
| `viewer` | `tenantService` | Current user + company |
| `CreditsQueries` / `CreditsMutations` | `creditsService` | `summary`, `usageHistory`, `adjustCredits` |
| `BillingQueries` | `billingService` | `subscription`, `invoices` |
| `CallLogsQueries` / `CallLogsMutations` | `callLogsService`, `creditsService` | `recent`, `connection`, `detail`, `recordCallCompleted` |
| `AnalyticsQueries` | `analyticsService` | `summary(granularity)` |
| `AgentsQueries` / `AgentsMutations` | `agentsService` | `statusSummary`, `list`, `byId`, `create`, `update` |
| `AgentLibraryQueries` | `agentLibraryService` | `list`, `bySlug` |
| `PhoneNumbersQueries` / `PhoneNumbersMutations` | `phoneNumbersService` | CRUD |
| `UploadedContactsQueries` / `Mutations` | `uploadedContactsService` | list, create, import, delete |
| `LeadsQueries` / `LeadsMutations` | `leadsService` | connection, breakdown, `importRows` |
| `CampaignsQueries` | `campaignsService` | `list` |
| `NotificationQueries` | `notificationsService` | paginated list |
| `IntegrationQueries` | `integrationsService` | `list` |
| `SchedulerQueries` | `schedulerService` | `upcoming` |
| `EventQueries` | `eventsService` | `recent` |

**Field resolvers:** `CallLog.lead`, `CallLog.aiAgent`, `CallLog.phoneNumber` use DataLoaders. Date fields serialized to ISO strings on `BillingInvoice`, `Notification`, etc.

**Helper parsers:** `parseCallLogFilter()`, `parseLeadFilter()` — convert GraphQL input to repository filter types.

### `guards.ts`

| Function | Description |
|----------|-------------|
| `requirePermission(ctx, permission)` | Throws `ForbiddenError` if missing |

---

## Services (`server/services`)

Each service is a class with a singleton export (e.g. `agentsService`). All methods take `TenantContext` as first argument unless noted.

### `tenant.service.ts` — `tenantService`

| Method | Description |
|--------|-------------|
| `resolveCompany(clerkOrgId)` | Lookup company by Clerk org ID |
| `resolveMembership(companyId, clerkUserId)` | User + active membership |
| `getPermissions(userId, role, custom?)` | Cached permission list (Redis, 30 min TTL) |
| `requirePermission(ctx, permission)` | Throws if unauthorized |
| `syncUserFromClerk(data)` | Upsert user from webhook/manual sync |
| `ensureUserFromClerk(clerkUserId)` | Fetch from Clerk API + upsert |
| `syncCompanyFromClerk(data)` | Upsert company |
| `syncMembership(data)` | Upsert company membership |
| `getViewer(ctx)` | GraphQL `viewer` query payload |

### `clerk-provision.service.ts`

Tenant provisioning from Clerk (used by webhooks, onboarding, context fallback).

| Export | Description |
|--------|-------------|
| `provisionOrganizationForUser(userId, input)` | Full org + company + membership + credits |
| `syncTenantFromClerk(clerkUserId)` | Recover/provision tenant for signed-in user |
| `handleClerkWebhookEvent(event)` | Processes Clerk webhook payloads |

**Internal helpers:** `ensureCreditBalance`, `upsertDbUserFromClerk`, `ensureCompanyForClerkOrg`, `linkUserToCompany`, `recoverOrphanLocalCompany`, `provisionTenantInDatabase`

### `agents.service.ts` — `agentsService`

| Method | Permission | Description |
|--------|------------|-------------|
| `getStatusSummary(ctx)` | `agents:read` | Active/inactive/total counts (cached) |
| `list(ctx)` | `agents:read` | All agents for company |
| `getById(ctx, id)` | `agents:read` | Single agent |
| `create(ctx, input)` | `agents:write` | Create agent; supports `libraryEntryId` |
| `update(ctx, id, input)` | `agents:write` | Partial update |

Invalidates agent status + page caches on mutations.

### `agent-library.service.ts` — `agentLibraryService`

| Method | Description |
|--------|-------------|
| `list(ctx)` | All library templates (global, not tenant-scoped) |
| `getBySlug(ctx, slug)` | Single template by slug |

### `call-logs.service.ts` — `callLogsService`

| Method | Description |
|--------|-------------|
| `getRecent(ctx, limit?)` | Latest call logs (cached) |
| `getConnection(ctx, { first, after, filter })` | Paginated, filterable list |
| `getDetail(ctx, id)` | Full call detail with transcript, sentiment, lead |
| `onCallCompleted(companyId, metrics)` | Increments analytics after call |

### `credits.service.ts` — `creditsService`

| Method | Description |
|--------|-------------|
| `getSummary(ctx)` | Balance, used, remaining (cached) |
| `getUsageHistory(ctx, { first, after })` | Paginated usage ledger |
| `debitForCall(ctx, callLogId, creditsUsed)` | Atomic debit + usage record |
| `adjustCredits(ctx, amount, description)` | Manual credit adjustment |

### `billing.service.ts` — `billingService`

| Method | Description |
|--------|-------------|
| `getSubscription(ctx)` | Active subscription plan |
| `getInvoices(ctx, { first, after })` | Paginated invoice history |

### `phone-numbers.service.ts` — `phoneNumbersService`

| Method | Description |
|--------|-------------|
| `list(ctx)` | All phone numbers |
| `getById(ctx, id)` | Single number with agent relations |
| `create(ctx, input)` | Provision number |
| `update(ctx, id, input)` | Update assignment/status |

### `leads.service.ts` — `leadsService`

| Method | Description |
|--------|-------------|
| `getConnection(ctx, { first, after, filter })` | Paginated leads; supports dormant filters |
| `getById(ctx, id)` | Single lead |
| `getTemperatureBreakdown(ctx)` | Hot/warm/cold counts |
| `importRows(ctx, rows)` | Bulk CSV import with temperature |

### `uploaded-contacts.service.ts` — `uploadedContactsService`

| Method | Description |
|--------|-------------|
| `list(ctx)` | Phone contact list |
| `create(ctx, phone)` | Single contact (validates 10-digit) |
| `importPhones(ctx, phones)` | Bulk import with dedup |
| `delete(ctx, id)` | Remove one |
| `bulkDelete(ctx, ids)` | Remove many |

### `campaigns.service.ts` — `campaignsService`

| Method | Description |
|--------|-------------|
| `list(ctx)` | Reactivation campaigns |

### `analytics.service.ts` — `analyticsService`

| Method | Description |
|--------|-------------|
| `getSummary(ctx, granularity?)` | Calls, connected, conversion rate |
| `incrementDailyMetrics(companyId, delta)` | Upsert daily snapshot |

### `events.service.ts` — `eventsService`

| Method | Description |
|--------|-------------|
| `listRecent(ctx, limit?)` | System event feed |
| `emit(companyId, type, payload)` | Create audit/event record |

### `notifications.service.ts`

| Class | Export | Method |
|-------|--------|--------|
| `NotificationsService` | `notificationsService` | `list(ctx, { first, after })` |
| `IntegrationsService` | `integrationsService` | `list(ctx)` — GraphQL integration list |
| `SchedulerService` | `schedulerService` | `listUpcoming(ctx, limit?)` |

### `integrations-management.service.ts` — `integrationsManagementService`

Used by REST routes (`app/api/integrations/**`, agent tools).

| Method | Permission | Description |
|--------|------------|-------------|
| `list(ctx)` | `integrations:read` | All integrations for company |
| `getByType(ctx, integrationId)` | `integrations:read` | Single integration |
| `connect(ctx, integrationId, account?)` | `integrations:write` | Mark connected |
| `disconnect(ctx, integrationId)` | `integrations:write` | Reset integration |
| `updateConfig(ctx, integrationId, config)` | `integrations:write` | Merge JSON config |
| `getAgentTools(ctx, agentId)` | `agents:read` | Tool assignments |
| `updateAgentTool(ctx, agentId, toolId, data)` | `agents:write` | Enable/configure tool |

---

## Repositories (`server/repositories`)

All repositories extend **`BaseRepository`** which provides:
- `constructor(prisma: PrismaClient)`
- `scope(companyId)` → `{ companyId }` for query filters

**Tenant isolation rule:** Every `find*` / `create` / `update` / `delete` method takes `companyId` as first argument.

### `base.repository.ts`

Abstract base class for all repositories.

### `tenant.repository.ts` — `TenantRepository`

| Method | Description |
|--------|-------------|
| `findCompanyByClerkOrgId(id)` | Company lookup |
| `findCompanyById(id)` | By primary key |
| `findUserByClerkId(clerkUserId)` | User lookup |
| `findMembership(companyId, userId)` | Membership with user + company |
| `upsertUser(data)` | Create/update user |
| `upsertCompany(data)` | Create/update company |
| `upsertMembership(data)` | Create/update membership |
| `findUsersByIds(companyId, ids)` | Batch for DataLoader |

### `agents.repository.ts` — `AgentsRepository`

| Method | Description |
|--------|-------------|
| `findStatusSummary(companyId)` | Count by status |
| `findById(companyId, id)` | Single agent |
| `findMany(companyId)` | All agents |
| `findByIds(companyId, ids)` | Batch |
| `create(companyId, data)` | Insert |
| `update(companyId, id, data)` | Patch |

Exports `CreateAgentData` type.

### `agent-library.repository.ts` — `AgentLibraryRepository`

| Method | Description |
|--------|-------------|
| `findMany()` | All templates (not tenant-scoped) |
| `findBySlug(slug)` | By slug |
| `upsertBySlug(data)` | Seed/update template |

Singleton: `agentLibraryRepository`.

### `call-logs.repository.ts` — `CallLogsRepository`

| Method | Description |
|--------|-------------|
| `findConnection(companyId, opts)` | Paginated + filtered |
| `findRecent(companyId, limit)` | Latest N |
| `findById(companyId, id)` | Detail with relations |
| `findLeadsByIds(companyId, ids)` | For DataLoader |
| `findAgentsByIds(companyId, ids)` | For DataLoader |

Exports `CallLogFilter` type.

### `phone-numbers.repository.ts` — `PhoneNumbersRepository`

| Method | Description |
|--------|-------------|
| `findMany(companyId)` | List with agent includes |
| `findById(companyId, id)` | Single |
| `findByIds(companyId, ids)` | Batch |
| `create(companyId, data)` | Insert |
| `update(companyId, id, data)` | Patch |

### `leads.repository.ts` — `LeadsRepository`

| Method | Description |
|--------|-------------|
| `findById(companyId, id)` | Single lead |
| `findConnection(companyId, opts)` | Paginated |
| `countByTemperature(companyId)` | Hot/warm/cold aggregation |
| `create(companyId, data)` | Insert |
| `findByPhone(companyId, phone)` | Dedup lookup |
| `ensureImportDefaults(companyId)` | Default pipeline/stage |
| `importRows(companyId, rows)` | Bulk upsert |

Exports `LeadFilter`, `LeadImportRow`, `LeadImportStats`.

### `credits.repository.ts` — `CreditsRepository`

| Method | Description |
|--------|-------------|
| `getBalance(companyId)` | Credit balance row |
| `ensureBalance(companyId)` | Create if missing |
| `listUsage(companyId, limit, after?)` | Usage history |
| `recordUsage(companyId, data)` | Atomic debit transaction |

### `billing.repository.ts`

| Class | Methods |
|-------|---------|
| `BillingRepository` | `getSubscription`, `listInvoices` |
| `AnalyticsRepository` | `getLatestSnapshot`, `upsertDailySnapshot` |

### `uploaded-contacts.repository.ts` — `UploadedContactsRepository`

| Method | Description |
|--------|-------------|
| `findMany(companyId)` | All contacts |
| `findById(companyId, id)` | Single |
| `findByPhones(companyId, phones)` | Dedup check |
| `create(companyId, phone)` | Insert one |
| `createMany(companyId, phones)` | Bulk insert |
| `delete(companyId, id)` | Remove one |
| `bulkDelete(companyId, ids)` | Remove many |

### `campaigns.repository.ts` — `CampaignsRepository`

| Method | Description |
|--------|-------------|
| `findMany(companyId)` | All campaigns |

### `notifications.repository.ts`

| Class | Methods |
|-------|---------|
| `NotificationsRepository` | `listForUser(companyId, userId, limit, after?)` |
| `IntegrationsRepository` | `findAll`, `findByType` |
| `SchedulerRepository` | `listUpcoming(companyId, limit)` |

### `events.repository.ts` — `EventsRepository`

| Method | Description |
|--------|-------------|
| `listRecent(companyId, limit)` | Recent system events |
| `create(companyId, data)` | Emit event |

---

## Cache Layer (`server/cache`)

### `redis.client.ts`

| Export | Description |
|--------|-------------|
| `redis` | `ioredis` client or `null` if `REDIS_URL` unset |
| `isRedisAvailable()` | Boolean helper |

### `keys.ts`

| Export | Description |
|--------|-------------|
| `CACHE_TTL` | Seconds: credits 5m, call logs 2m, analytics 5m, permissions 30m, page 30s |
| `PAGE_CACHE_STALE_MS` | `10000` — serve stale Redis page cache under 10s |
| `PageCacheKey` | Union of dashboard page keys |
| `PageCacheParams` | `{ id?, slug?, after?, filter? }` |
| `cacheKeys` | Key builders: `companyCredits`, `userPermissions`, `page(...)`, etc. |

### `cache.service.ts` — `cacheService`

| Method | Description |
|--------|-------------|
| `get(key)` / `set(key, value, ttl)` | Raw Redis get/set |
| `del(...keys)` | Delete keys |
| `getOrSet(key, ttl, factory)` | Cache-aside pattern |
| `invalidateCompanyCredits(companyId)` | Bust credits cache |
| `invalidateCompanyCallLogs(companyId)` | Bust call log cache |
| `invalidateCompanyAnalytics(companyId)` | Bust analytics |
| `invalidateCompanyAgentStatus(companyId)` | Bust agent summary |
| `invalidateUserPermissions(userId)` | Bust permissions |
| `invalidateCallRelated(companyId)` | Multi-key bust after calls |
| `invalidatePage(companyId, pageKey, params?)` | Single page |
| `invalidatePagesForCompany(companyId, pageKeys)` | Multiple pages |
| `invalidateSettingsPages(companyId)` | Settings + setup pages |
| `invalidateAgentPages(companyId)` | Agent list + detail |
| `invalidateAllPages(companyId)` | Full page cache flush |

### `page-cache.service.ts` — `pageCacheService`

| Method | Description |
|--------|-------------|
| `getPageData(cacheKey, loader, options?)` | Stale-while-revalidate page caching |

Returns `{ data, cachedAt, fromCache }`.

---

## Page Cache (`server/page-cache`)

### `registry.ts`

| Function | Description |
|----------|-------------|
| `getPageLoader(pageKey)` | Returns loader function or `null` |
| `isValidPageCacheKey(pageKey)` | Type guard for route param |

**Registered pages:**

| `pageKey` | Loader | Required params |
|-----------|--------|-----------------|
| `home` | `loadHomePage` | — |
| `billing` | `loadBillingPage` | `after?` |
| `call-logs` | `loadCallLogsPage` | `after?`, `filter?` |
| `call-detail` | `loadCallDetailPage` | `id` |
| `agents` | `loadAgentsPage` | — |
| `agent-detail` | `loadAgentDetailPage` | `id` |
| `agent-library` | `loadAgentLibraryPage` | — |
| `agent-template` | `loadAgentTemplatePage` | `slug` |
| `lead-reactivation` | `loadLeadReactivationPage` | `after?`, `filter?` |
| `setup` | `loadSetupPage` | — |
| `settings` | `loadSettingsPage` | — |
| `phone-detail` | `loadPhoneDetailPage` | `id`, `after?` |
| `phone-contacts` | `loadPhoneContactsPage` | — |

### `loaders/index.ts`

Each `load*Page(request, params)` calls `executeGraphQLFromRequest()` with the matching query from `lib/graphql/queries/`.

### `execute-graphql.ts`

| Function | Description |
|----------|-------------|
| `executeGraphQLFromRequest(request, query, variables?)` | Internal Yoga POST with cookie forwarding |

### `parse-params.ts`

| Function | Description |
|----------|-------------|
| `parsePageCacheParams(searchParams)` | Parses `id`, `slug`, `after`, `filter` from URL |

---

## Tests (`server/__tests__`)

### `tenant-isolation.test.ts`

Node.js built-in test runner (`node:test`).

| Test | Asserts |
|------|---------|
| Credit balance for unknown company | Returns `null` |
| Recent call logs for unknown company | Returns `[]` |
| `findById` cross-tenant | Returns `null` |

Validates repository `companyId` scoping.

---

## Keywords & Conventions

| Keyword | Meaning in this codebase |
|---------|--------------------------|
| `TenantContext` / `ctx` | Authenticated user + company scope for all server ops |
| `companyId` | MongoDB tenant key; **always** passed to repositories |
| `clerkUserId` | Clerk external user ID |
| `orgId` | Clerk organization ID → maps to `company.clerkOrganizationId` |
| `scope(companyId)` | Repository helper returning `{ companyId }` filter |
| `DataLoader` | Per-request batched relation loading |
| `Connection` | Relay-style paginated result with cursors |
| `PageCacheKey` | Dashboard page identifier for Redis cache |
| `IntegrationId` | e.g. `google-sheets`, `google-calendar` (from `lib/integrations`) |
| `AgentToolId` | e.g. `faq`, `billing`, `google-calendar` (from `lib/tools`) |
| `PERMISSIONS.*` | Colon-separated capability strings checked in services |
| `gqlDebug` / `GQL_TRACE` | Opt-in GraphQL request tracing |
| `syncTenantFromClerk` | Lazy tenant provisioning on first authenticated request |
| `local:{userId}` | Synthetic Clerk org ID when Organizations disabled |

**Naming patterns:**
- `*.service.ts` → business logic + singleton `*Service`
- `*.repository.ts` → Prisma access + `*Repository` class
- `map*ToUI` lives in `lib/mappers/` (client boundary), not `src/`
- GraphQL enums are `SCREAMING_SNAKE`; services convert to/from lowercase kebab for UI

---

## Import Map (Quick Reference)

| Consumer | Import from |
|----------|-------------|
| `app/api/graphql/route.ts` | `@/server/graphql/yoga` |
| `app/api/page-cache/[pageKey]/route.ts` | `@/server/page-cache/registry`, `page-cache.service`, `parse-params` |
| `app/api/webhooks/clerk/route.ts` | `@/server/services/clerk-provision.service` |
| `app/api/integrations/**` | `@/server/services/integrations-management.service` |
| `lib/api/tenant-context.ts` | `@/server/*` (mirrors GraphQL context resolution) |
| `lib/prisma.ts` | Re-exports `@/server/lib/prisma` |
| `lib/integrations/db-state.ts` | Uses `prisma` + `integrationsManagementService` patterns |

**Path alias:** `@/server/...` maps to `src/server/...` (configured in `tsconfig.json`).

---

## Related: `lib/` vs `src/`

| Concern | Location |
|---------|----------|
| GraphQL query strings (client) | `lib/graphql/queries/` |
| GraphQL fetch helpers | `lib/graphql/client.ts`, `lib/graphql/api.ts` |
| UI types, filters, formatters | `lib/*-data.ts` |
| GraphQL → UI mappers | `lib/mappers/` |
| API route auth helpers | `lib/api/auth.ts`, `lib/api/tenant-context.ts` |
| Server business logic | `src/server/services/` |
| Database access | `src/server/repositories/` |
| GraphQL schema + resolvers | `src/server/graphql/`, `src/server/resolvers/` |

The dashboard typically loads data via `lib/page-cache/client.ts` → `app/api/page-cache` → `src/server/page-cache` → internal GraphQL → `src/server/services`.
