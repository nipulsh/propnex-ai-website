# Hooks Documentation

This document describes every file in the `hooks/` folder — the React custom hooks layer for PropNex AI. These hooks connect dashboard pages to server data (GraphQL via the page-cache API), manage polling/refresh, surface UI notifications, and handle client-side utilities.

---

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Architecture Overview](#architecture-overview)
3. [Shared Concepts & Keywords](#shared-concepts--keywords)
4. [Foundation Hooks](#foundation-hooks)
   - [use-cached-page-poll.ts](#use-cached-page-pollts)
   - [use-page-status-notification.ts](#use-page-status-notificationts)
   - [use-mobile.ts](#use-mobilets)
   - [use-realtime-usage.ts](#use-realtime-usagets)
5. [Page Data Hooks (GraphQL)](#page-data-hooks-graphql)
   - [use-home-dashboard-graphql.ts](#use-home-dashboard-graphts)
   - [use-agents-graphql.ts](#use-agents-graphts)
   - [use-agent-detail-graphql.ts](#use-agent-detail-graphts)
   - [use-agent-library-graphql.ts](#use-agent-library-graphts)
   - [use-call-logs-graphql.ts](#use-call-logs-graphts)
   - [use-call-detail-graphql.ts](#use-call-detail-graphts)
   - [use-phone-numbers-graphql.ts](#use-phone-numbers-graphts)
   - [use-phone-number-detail-graphql.ts](#use-phone-number-detail-graphts)
   - [use-contact-phones-graphql.ts](#use-contact-phones-graphts)
   - [use-billing-graphql.ts](#use-billing-graphts)
   - [use-lead-reactivation-graphql.ts](#use-lead-reactivation-graphts)
   - [use-setup-graphql.ts](#use-setup-graphts)
   - [use-settings-graphql.ts](#use-settings-graphts)
6. [Hook Dependency Graph](#hook-dependency-graph)
7. [Consumer Map](#consumer-map)

---

## Folder Structure

```
hooks/
├── use-cached-page-poll.ts          # Core polling primitive (used by all GraphQL page hooks)
├── use-page-status-notification.ts  # Loading/error toast notifications
├── use-mobile.ts                    # Responsive breakpoint detection
├── use-realtime-usage.ts            # Live credit/money consumption simulation
│
├── use-home-dashboard-graphql.ts    # Home dashboard page data
├── use-agents-graphql.ts            # Agents list + server mutations
├── use-agent-detail-graphql.ts      # Single agent detail page
├── use-agent-library-graphql.ts     # Agent template library
├── use-call-logs-graphql.ts         # Call logs list with pagination
├── use-call-detail-graphql.ts       # Single call detail
├── use-phone-numbers-graphql.ts     # Phone numbers list + mutations
├── use-phone-number-detail-graphql.ts # Single phone number detail
├── use-contact-phones-graphql.ts    # Uploaded contact phones
├── use-billing-graphql.ts           # Billing & subscription data
├── use-lead-reactivation-graphql.ts # Dormant leads for reactivation
├── use-setup-graphql.ts             # Onboarding/setup wizard data
└── use-settings-graphql.ts          # User settings & integrations
```

All hooks live in a **flat directory** at the project root (`hooks/`). There are no subfolders. Imports use the `@/hooks/...` path alias.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Dashboard Page Components                    │
│  (e.g. agents-page-content.tsx, home-page-content.tsx)          │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐      ┌───────────────────────────────┐
│  use*GraphQL hooks     │      │ usePageStatusNotification     │
│  (page-specific data)  │      │ useActionNotification         │
└────────────┬───────────┘      └───────────────────────────────┘
             │
             ▼
┌────────────────────────┐      ┌───────────────────────────────┐
│  useCachedPagePoll     │─────▶│  fetchCachedPage()            │
│  (polling + reload)    │      │  lib/page-cache/client.ts     │
└────────────┬───────────┘      └──────────────┬────────────────┘
             │                                  │
             ▼                                  ▼
┌────────────────────────┐      ┌───────────────────────────────┐
│  Zustand stores        │      │  GET /api/page-cache/[key]    │
│  (agents-store, etc.)  │      │  → GraphQL resolver layer     │
└────────────────────────┘      └───────────────────────────────┘
```

**Design pattern:** Most page hooks follow the same recipe:

1. Define `fetchPage` — calls `fetchCachedPage(pageKey, params)` for a specific cache key.
2. Define `applyPageData` — maps GraphQL response → UI types, writes to Zustand store or local `useState`.
3. Pass both into `useCachedPagePoll` for initial load + 10s silent polling.
4. Return `{ reload }` (and sometimes local state) to the consuming component.

Mutations (create/update) are exported as **standalone async functions** (not hooks) where needed, e.g. `createAgentOnServer`.

---

## Shared Concepts & Keywords

| Keyword | Meaning |
|---------|---------|
| `"use client"` | Next.js directive — hook runs only on the client (required for `useEffect`, browser APIs). |
| `fetchCachedPage` | Client helper that hits `/api/page-cache/{pageKey}` and returns typed GraphQL data. |
| `PageCacheKey` | Union of valid page keys: `"home"`, `"agents"`, `"call-logs"`, etc. |
| `useCachedPagePoll` | Generic polling hook — initial fetch + interval refresh. |
| `reload` | Manual refetch function returned by polling hooks; supports `{ silent, showLoading }`. |
| `applyPageData` | Callback that transforms API response and updates store/state. |
| `deps` | Extra dependency array passed to `useCachedPagePoll` to re-trigger fetch when filters/IDs change. |
| `silent: true` | Background poll — no loading spinner on subsequent fetches. |
| `skipHidden` | Skip fetch when browser tab is hidden (`document.visibilityState === "hidden"`). |
| Zustand store | Global client state (`useAgentsStore`, `useBillingStore`, etc.) — hooks write, components read. |
| `mapGraphQL*ToUI` | Mapper functions in `lib/mappers/` that normalize GraphQL shapes to UI types. |

---

## Foundation Hooks

### use-cached-page-poll.ts

**Purpose:** The foundational data-fetching primitive. Every `use*GraphQL` hook builds on this.

**Exports:**

| Export | Type | Description |
|--------|------|-------------|
| `useCachedPagePoll` | `<T>(options) => { reload }` | Polls `fetchPage` on mount and every 10s. |

**Types:**

```ts
type ReloadOptions = {
  silent?: boolean;       // Default false — true skips loading indicator
  showLoading?: boolean;  // Override auto loading behavior
};

type UseCachedPagePollOptions<T> = {
  enabled?: boolean;           // Default true — disable polling entirely
  intervalMs?: number;         // Default 10_000 (10 seconds)
  deps?: unknown[];            // Re-run effect when these change
  fetchPage: () => Promise<T>; // Data fetcher
  onData: (data: T) => void;   // Success handler
  onError?: (message: string) => void;
  onLoading?: (loading: boolean) => void;
  skipHidden?: boolean;        // Default true — skip when tab hidden
};
```

**Internal behavior:**

- Uses `useRef` for callbacks (`fetchPage`, `onData`, `onError`, `onLoading`) to avoid stale closures without re-subscribing the interval.
- `hasLoadedOnceRef` — first load shows loading; subsequent interval polls are silent.
- `reload(options)` — callable manually; respects `skipHidden`.
- On unmount: clears interval and resets `hasLoadedOnceRef`.

**Constants:**

- `DEFAULT_INTERVAL_MS = 10_000`

---

### use-page-status-notification.ts

**Purpose:** Bridges page loading/error state to the side notification system (`useSideNotification`).

**Exports:**

| Export | Description |
|--------|-------------|
| `usePageStatusNotification` | Shows persistent info toast while loading; dismisses on complete; shows error toast once per unique error. |
| `useActionNotification` | One-shot success/error/info toast for user actions (create, update, delete). |

**Types:**

```ts
type UsePageStatusNotificationOptions = {
  isInitialLoading: boolean;
  loadingMessage: string;
  loadingId?: string;        // Default "page-loading"
  error?: string | null;
  onErrorClear?: () => void; // Called after error is shown
};

type UseActionNotificationOptions = {
  message: string | null;
  type: SideNotificationType; // "info" | "success" | "error" | "warning"
  duration?: number;
  onClear?: () => void;
};
```

**Internal behavior:**

- `lastErrorRef` / `lastMessageRef` — deduplicates repeated identical notifications.
- Loading notification uses a fixed `id` so it can be dismissed when loading completes.

---

### use-mobile.ts

**Purpose:** Detects whether the viewport is below the mobile breakpoint (768px). Used by the sidebar for responsive layout.

**Exports:**

| Export | Returns | Description |
|--------|---------|-------------|
| `useIsMobile` | `boolean` | `true` when `window.innerWidth < 768`. |

**Constants:**

- `MOBILE_BREAKPOINT = 768`

**Implementation:** Uses `window.matchMedia('(max-width: 767px)')` with a `change` listener. Returns `!!isMobile` (coerces initial `undefined` to `false` during SSR/hydration).

**Note:** This is the only hook in the folder **without** `"use client"` — it still only works in the browser because of `window` access inside `useEffect`.

---

### use-realtime-usage.ts

**Purpose:** Simulates live credit and INR money consumption while telephony channels are active. Mounted once in `components/common/realtime-usage-tracker.tsx` inside the dashboard layout.

**Exports:**

| Export | Description |
|--------|-------------|
| `useRealtimeUsage` | Ticks every 1 second when `activeChannels > 0`. |

**Dependencies:**

- `useSetupStore` → `state.channelUsage.totalChannels`
- `useUsageStore` → `state.recordUsage`
- `calculateActiveChannelTick` from `lib/credit-usage`

**Constants:**

- `TICK_INTERVAL_MS = 1000`

**Behavior:** When channels are active, computes credit/money delta per second and calls `recordUsage(delta)`. No return value — side-effect only.

---

## Page Data Hooks (GraphQL)

Each hook below fetches data via `fetchCachedPage` with a specific `PageCacheKey`. Unless noted, polling interval is 10 seconds via `useCachedPagePoll`.

---

### use-home-dashboard-graphql.ts

**Page key:** `"home"`

**Hook:** `useHomeDashboardGraphQL()`

**Store:** `useHomeDashboardStore`

| Store action | Role |
|--------------|------|
| `setPageData` | Receives full `HomePageResult` directly |
| `setLoading` | Loading flag |
| `setError` | Sets `true` on error (boolean, not message) |

**Returns:** `{ reload }`

**Consumer:** `components/home/home-page-content.tsx`

---

### use-agents-graphql.ts

**Page key:** `"agents"`

**Hook:** `useAgentsGraphQL()`

**Store:** `useAgentsStore` — `setAgents`, `setLoading`, `setError`

**Data flow:**

1. Fetches `agents.list` from cache.
2. Maps each agent via `mapGraphQLAgentToUI`.
3. Writes to agents store.

**Returns:** `{ reload }`

**Server mutations (not hooks):**

| Function | API | Description |
|----------|-----|-------------|
| `createAgentOnServer(input)` | `createAgentApi` | Creates agent, returns mapped UI agent |
| `updateAgentOnServer(id, input)` | `updateAgentApi` | Updates agent, returns mapped UI agent |

**Consumers:** `agents-page-content.tsx`, `create-agent-page-content.tsx`, `tools-page-content.tsx`

---

### use-agent-detail-graphql.ts

**Page key:** `"agent-detail"` — params: `{ id: agentId }`

**Hook:** `useAgentDetailGraphQL(agentId: string)`

**Stores:**

- `useAgentDetailStore` — `setLoading`, `setError`, `hydrate`, `setCalls`, `setAssignedNumbers`, `reset`
- `useAgentsStore` — `upsertAgent` (keeps list in sync)

**Data flow:**

1. Fetches agent by ID, phone numbers list, and call logs connection.
2. Filters phone numbers assigned to this agent (inbound/outbound/both).
3. Maps call logs via `mapGraphQLCallLogToUI`.
4. Resets store when `agentId` changes.

**Options passed to poll:** `enabled: Boolean(agentId)`, `deps: [agentId]`

**Returns:** `{ reload }`

**Consumer:** `components/agents/detail/agent-detail-page-content.tsx`

---

### use-agent-library-graphql.ts

**Page keys:** `"agent-library"` and `"agent-template"`

**Hooks:**

#### `useAgentLibraryGraphQL()`

- Fetches all library templates.
- Uses **local state** (`useState`) — not a Zustand store.
- Maps via `mapGraphQLLibraryEntryToTemplate`.

**Returns:** `{ templates, error, reload }`

**Consumer:** `components/agents/library/agent-library-page-content.tsx`

#### `useAgentLibraryTemplate(slug: string)`

- Fetches single template by slug.
- Local state: `template`, `loading`, `error`.
- Poll enabled only when `slug` is truthy.

**Returns:** `{ template, loading, error }`

**Consumer:** `components/agents/library/deploy-agent-page-content.tsx`

---

### use-call-logs-graphql.ts

**Page key:** `"call-logs"` — params: `{ filter }`, pagination via `{ after: endCursor }`

**Hook:** `useCallLogsGraphQL(filter?: Record<string, unknown>)`

**State:** Local (`useState`) — not Zustand.

**Exported type:**

```ts
type GraphQLCallLog = {
  id, startedAt, direction, status, durationSeconds,
  leadName, agentName, agentId, phoneNumber, lineLabel,
  leadPhone, phoneNumberId, outcome, leadTemperature,
  leadScore, callCost, provider, summarySnippet,
  hasRecording, recordingUrl, sentimentOutcome, hasTranscript
};
```

**Helper functions (module-private):**

| Function | Purpose |
|----------|---------|
| `toOutcome(value)` | Normalizes GraphQL outcome enum to `CallOutcome` |
| `toTemperature(value, callId)` | Maps temperature or falls back to `getLeadTemperatureForCall` |
| `extractAiSummary(summary)` | Pulls snippet from `interests` or first `discussionPoints` |
| `mapNode(node)` | Maps a single GraphQL call log node to `GraphQLCallLog` |

**Pagination:**

- `loadMore()` — fetches next page with `after: endCursor`, appends to `logs`.
- Tracks `endCursor` and `hasNextPage` from `pageInfo`.

**Returns:** `{ logs, isLoading, error, hasNextPage, loadMore, reload }`

**Consumer:** `components/call-logs/call-logs-page-content.tsx`

---

### use-call-detail-graphql.ts

**Page key:** `"call-detail"` — params: `{ id: callId }`

**Hook:** `useCallDetailGraphQL(callId: string)`

**State:** Local — `detail: CallDetail | null`, `isLoading`, `error`

**Data flow:**

1. Fetches `callLogs.detail`.
2. Maps via `mapGraphQLCallDetailToUI`.
3. Sets error `"Call not found"` if detail is null.

**Returns:** `{ detail, isLoading, error, reload }`

**Consumer:** `components/call-details/call-detail-page-content.tsx`

---

### use-phone-numbers-graphql.ts

**Page key:** Uses `fetchPhoneNumbersPage()` directly (not page-cache key string, but same GraphQL layer).

**Hook:** `usePhoneNumbersGraphQL()`

**Store:** `usePhoneNumbersStore` — `setNumbers`, `setLoading`, `setError`

**Server mutations:**

| Function | Description |
|----------|-------------|
| `createPhoneNumberOnServer(input)` | Creates phone number with provider + agent assignments |
| `updatePhoneNumberOnServer(id, input)` | Updates existing phone number |

**Returns:** `{ reload }`

**Consumer:** `components/phone-numbers/phone-numbers-page-content.tsx`

---

### use-phone-number-detail-graphql.ts

**Page key:** `"phone-detail"` — params: `{ id: phoneNumberId }`

**Hook:** `usePhoneNumberDetailGraphQL(phoneNumberId: string)`

**Stores:**

- `usePhoneNumberDetailStore` — detail page state
- `usePhoneNumbersStore` — `upsertNumber`

**Data flow:**

1. Fetches phone number by ID + related call logs.
2. Enriches each call with `phoneNumberId`, `phoneNumber`, `lineLabel`.
3. Resets on `phoneNumberId` change.

**Returns:** `{ reload }`

**Consumer:** `components/phone-numbers/detail/phone-number-detail-page-content.tsx`

---

### use-contact-phones-graphql.ts

**Page key:** `"phone-contacts"`

**Hook:** `useContactPhonesGraphQL()`

**Store:** `useContactPhonesStore` — `setContacts`, `setLoading`, `setError`

**Data flow:** Sets `data.uploadedContacts.list` directly (no mapper).

**Returns:** `{ reload }`

**Consumer:** `components/contact-phones/contact-phones-page-content.tsx`

---

### use-billing-graphql.ts

**Page key:** `"billing"`

**Hook:** `useBillingGraphQL()`

**Store:** `useBillingStore` — `setInvoices`, `setPurchaseHistory`, `setSubscription`

**State:** Local `isLoading`, `error` (returned to component, not only in store).

**Data flow:**

- Subscription from `data.billing.subscription`
- Invoices from `data.billing.invoices.edges`
- Purchase history derived from `data.credits.usageHistory.edges` → `PurchaseHistoryItem[]`

**Returns:** `{ isLoading, error }` — no `reload` exposed (poll still runs internally).

**Consumer:** `components/billing/billing-page-content.tsx`

---

### use-lead-reactivation-graphql.ts

**Page key:** `"lead-reactivation"` — params: `{ filter: { dormantOnly: true, minDaysInactive } }`

**Hook:** `useLeadReactivationGraphQL()`

**Store:** `useLeadReactivationStore` — `setLeads`, `setLoading`, `setError`, reads `inactivity` filter

**Filter mapping:**

| Store `inactivity` | `minDaysInactive` |
|--------------------|-------------------|
| `"30-plus"` | 30 |
| `"60-plus"` | 60 |
| `"90-plus"` | 90 |
| (default) | 30 |

**Helper:** `mapLeadToDormant(node)` — computes `daysInactive`, builds `DormantLead` shape.

**Returns:** `{ reload }`

**Consumer:** `components/lead-reactivation/lead-reactivation-page-content.tsx`

---

### use-setup-graphql.ts

**Page key:** `"setup"`

**Hook:** `useSetupGraphQL()`

**Store:** `useSetupStore` — `setPhoneNumbersFromApi`, `setIntegrationsFromApi`

**Error handling:** Swallowed intentionally — setup wizard keeps local defaults on failure.

**Returns:** Nothing (side-effect hook — mount and poll only).

**Consumer:** `components/setup/setup-page-content.tsx`

---

### use-settings-graphql.ts

**Page key:** `"settings"`

**Hook:** `useSettingsGraphQL()`

**Store:** `useSettingsStore` — `setViewer`, `setIntegrations`

**Error handling:** Swallowed — Clerk profile remains primary fallback.

**Returns:** Nothing (side-effect hook).

**Consumer:** `components/settings/settings-page-content.tsx`

---

## Hook Dependency Graph

```
useCachedPagePoll
├── useHomeDashboardGraphQL
├── useAgentsGraphQL
├── useAgentDetailGraphQL
├── useAgentLibraryGraphQL
│   └── useAgentLibraryTemplate
├── useCallLogsGraphQL
├── useCallDetailGraphQL
├── usePhoneNumbersGraphQL
├── usePhoneNumberDetailGraphQL
├── useContactPhonesGraphQL
├── useBillingGraphQL
├── useLeadReactivationGraphQL
├── useSetupGraphQL
└── useSettingsGraphQL

useSideNotification (component)
├── usePageStatusNotification
└── useActionNotification

useSetupStore
└── useRealtimeUsage

(no dependencies)
└── useIsMobile
```

---

## Consumer Map

| Hook | Used in |
|------|---------|
| `useCachedPagePoll` | All `use-*-graphql.ts` files (internal) |
| `usePageStatusNotification` | home, agents, agent-detail, call-logs, call-detail, phone-numbers, phone-detail, contact-phones, billing |
| `useActionNotification` | agent-detail, phone-number-detail, integrations |
| `useIsMobile` | `components/ui/sidebar.tsx` |
| `useRealtimeUsage` | `components/common/realtime-usage-tracker.tsx` |
| `useHomeDashboardGraphQL` | `components/home/home-page-content.tsx` |
| `useAgentsGraphQL` | agents page, create agent, tools page |
| `useAgentDetailGraphQL` | `components/agents/detail/agent-detail-page-content.tsx` |
| `useAgentLibraryGraphQL` | `components/agents/library/agent-library-page-content.tsx` |
| `useAgentLibraryTemplate` | `components/agents/library/deploy-agent-page-content.tsx` |
| `useCallLogsGraphQL` | `components/call-logs/call-logs-page-content.tsx` |
| `useCallDetailGraphQL` | `components/call-details/call-detail-page-content.tsx` |
| `usePhoneNumbersGraphQL` | `components/phone-numbers/phone-numbers-page-content.tsx` |
| `usePhoneNumberDetailGraphQL` | `components/phone-numbers/detail/phone-number-detail-page-content.tsx` |
| `useContactPhonesGraphQL` | `components/contact-phones/contact-phones-page-content.tsx` |
| `useBillingGraphQL` | `components/billing/billing-page-content.tsx` |
| `useLeadReactivationGraphQL` | `components/lead-reactivation/lead-reactivation-page-content.tsx` |
| `useSetupGraphQL` | `components/setup/setup-page-content.tsx` |
| `useSettingsGraphQL` | `components/settings/settings-page-content.tsx` |

---

## Typical Usage Pattern

```tsx
"use client";

import { useAgentsGraphQL } from "@/hooks/use-agents-graphql";
import { usePageStatusNotification } from "@/hooks/use-page-status-notification";
import { useAgentsStore } from "@/stores/agents-store";

export function AgentsPageContent() {
  const { reload } = useAgentsGraphQL();
  const agents = useAgentsStore((s) => s.agents);
  const isLoading = useAgentsStore((s) => s.isLoading);
  const error = useAgentsStore((s) => s.error);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading agents…",
    error,
    onErrorClear: () => useAgentsStore.getState().setError(null),
  });

  // render agents, call reload() after mutations
}
```

---

## Adding a New Page Hook

1. Add a `PageCacheKey` in `lib/page-cache/client.ts` and implement the API route handler.
2. Create `hooks/use-{page}-graphql.ts` following the established pattern.
3. Use `useCachedPagePoll` with appropriate `deps` for dynamic params.
4. Prefer Zustand store for shared list state; use local `useState` for isolated/detail views.
5. Wire `usePageStatusNotification` in the page component for loading/error UX.
6. Export mutation helpers as plain async functions if the page needs create/update/delete.

---

## Related Files

| File | Role |
|------|------|
| `lib/page-cache/client.ts` | `fetchCachedPage`, `PageCacheKey`, `PageCacheParams` |
| `app/api/page-cache/[pageKey]/route.ts` | Server-side cache + GraphQL execution |
| `lib/graphql/api.ts` | Direct GraphQL mutations (agents, phone numbers) |
| `lib/mappers/*.ts` | GraphQL → UI type transformers |
| `stores/*-store.ts` | Zustand stores consumed by hooks and components |
| `components/common/side-notification.tsx` | Toast notification provider |
