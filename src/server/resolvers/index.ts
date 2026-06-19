import type { TenantContext } from "@/server/types/context";
import { agentsService } from "@/server/services/agents.service";
import { analyticsService } from "@/server/services/analytics.service";
import { billingService } from "@/server/services/billing.service";
import { callLogsService } from "@/server/services/call-logs.service";
import { creditsService } from "@/server/services/credits.service";
import { eventsService } from "@/server/services/events.service";
import { leadsService } from "@/server/services/leads.service";
import {
  integrationsService,
  notificationsService,
  schedulerService,
} from "@/server/services/notifications.service";
import { tenantService } from "@/server/services/tenant.service";

function parseCallLogFilter(filter?: {
  direction?: string;
  status?: string;
  aiAgentId?: string;
  assignedUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  if (!filter) return undefined;
  return {
    direction: filter.direction as never,
    status: filter.status as never,
    aiAgentId: filter.aiAgentId,
    assignedUserId: filter.assignedUserId,
    dateFrom: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
    dateTo: filter.dateTo ? new Date(filter.dateTo) : undefined,
    search: filter.search,
  };
}

export const resolvers = {
  Query: {
    viewer: (_: unknown, __: unknown, ctx: TenantContext) =>
      tenantService.getViewer(ctx),
    credits: () => ({}),
    billing: () => ({}),
    callLogs: () => ({}),
    analytics: () => ({}),
    agents: () => ({}),
    leads: () => ({}),
    notifications: () => ({}),
    integrations: () => ({}),
    scheduler: () => ({}),
    events: () => ({}),
  },

  Mutation: {
    credits: () => ({}),
    callLogs: () => ({}),
  },

  CreditsQueries: {
    summary: (_: unknown, __: unknown, ctx: TenantContext) =>
      creditsService.getSummary(ctx),
    usageHistory: (
      _: unknown,
      args: { first?: number; after?: string },
      ctx: TenantContext,
    ) => creditsService.getUsageHistory(ctx, args),
  },

  CreditsMutations: {
    adjustCredits: (
      _: unknown,
      args: { amount: number; description: string },
      ctx: TenantContext,
    ) => creditsService.adjustCredits(ctx, args.amount, args.description),
  },

  BillingQueries: {
    subscription: (_: unknown, __: unknown, ctx: TenantContext) =>
      billingService.getSubscription(ctx),
    invoices: (
      _: unknown,
      args: { first?: number; after?: string },
      ctx: TenantContext,
    ) => billingService.getInvoices(ctx, args),
  },

  CallLogsQueries: {
    recent: (_: unknown, args: { limit?: number }, ctx: TenantContext) =>
      callLogsService.getRecent(ctx, args.limit),
    connection: (
      _: unknown,
      args: {
        first?: number;
        after?: string;
        filter?: Parameters<typeof parseCallLogFilter>[0];
      },
      ctx: TenantContext,
    ) =>
      callLogsService.getConnection(ctx, {
        first: args.first,
        after: args.after,
        filter: parseCallLogFilter(args.filter),
      }),
    detail: (_: unknown, args: { id: string }, ctx: TenantContext) =>
      callLogsService.getDetail(ctx, args.id),
  },

  CallLogsMutations: {
    recordCallCompleted: async (
      _: unknown,
      args: { callLogId: string; creditsUsed: number },
      ctx: TenantContext,
    ) => {
      await creditsService.debitForCall(
        ctx,
        args.callLogId,
        args.creditsUsed,
      );
      await callLogsService.onCallCompleted(ctx.companyId, {
        totalCalls: 1,
        connectedCalls: 1,
      });
      return true;
    },
  },

  AnalyticsQueries: {
    summary: (
      _: unknown,
      args: { granularity?: "DAILY" | "WEEKLY" | "MONTHLY" },
      ctx: TenantContext,
    ) => analyticsService.getSummary(ctx, args.granularity),
  },

  AgentsQueries: {
    statusSummary: (_: unknown, __: unknown, ctx: TenantContext) =>
      agentsService.getStatusSummary(ctx),
    list: (_: unknown, __: unknown, ctx: TenantContext) =>
      agentsService.list(ctx),
    byId: (_: unknown, args: { id: string }, ctx: TenantContext) =>
      agentsService.getById(ctx, args.id),
  },

  LeadsQueries: {
    connection: (
      _: unknown,
      args: { first?: number; after?: string },
      ctx: TenantContext,
    ) => leadsService.getConnection(ctx, args),
    byId: (_: unknown, args: { id: string }, ctx: TenantContext) =>
      leadsService.getById(ctx, args.id),
  },

  NotificationQueries: {
    list: (
      _: unknown,
      args: { first?: number; after?: string },
      ctx: TenantContext,
    ) => notificationsService.list(ctx, args),
  },

  IntegrationQueries: {
    list: (_: unknown, __: unknown, ctx: TenantContext) =>
      integrationsService.list(ctx),
  },

  SchedulerQueries: {
    upcoming: (_: unknown, args: { limit?: number }, ctx: TenantContext) =>
      schedulerService.listUpcoming(ctx, args.limit),
  },

  EventQueries: {
    recent: (_: unknown, args: { limit?: number }, ctx: TenantContext) =>
      eventsService.listRecent(ctx, args.limit),
  },

  CallLog: {
    lead: (parent: { leadId?: string | null }, _: unknown, ctx: TenantContext) =>
      parent.leadId ? ctx.loaders.lead.load(parent.leadId) : null,
    aiAgent: (
      parent: { aiAgentId?: string | null },
      _: unknown,
      ctx: TenantContext,
    ) => (parent.aiAgentId ? ctx.loaders.aiAgent.load(parent.aiAgentId) : null),
  },

  CreditUsage: {
    createdAt: (parent: { createdAt: Date | string }) =>
      typeof parent.createdAt === "string"
        ? parent.createdAt
        : parent.createdAt.toISOString(),
    reason: (parent: { reason: string }) => parent.reason,
  },

  BillingInvoice: {
    issuedAt: (parent: { issuedAt: Date }) => parent.issuedAt.toISOString(),
    dueAt: (parent: { dueAt?: Date | null }) =>
      parent.dueAt?.toISOString() ?? null,
    paidAt: (parent: { paidAt?: Date | null }) =>
      parent.paidAt?.toISOString() ?? null,
  },

  Notification: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    readAt: (parent: { readAt?: Date | null }) =>
      parent.readAt?.toISOString() ?? null,
  },

  Integration: {
    lastSyncAt: (parent: { lastSyncAt?: Date | null }) =>
      parent.lastSyncAt?.toISOString() ?? null,
  },

  SchedulerEvent: {
    startAt: (parent: { startAt: Date }) => parent.startAt.toISOString(),
    endAt: (parent: { endAt?: Date | null }) =>
      parent.endAt?.toISOString() ?? null,
  },

  SystemEvent: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },
};
