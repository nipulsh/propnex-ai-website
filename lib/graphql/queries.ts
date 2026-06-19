export const CREDITS_SUMMARY_QUERY = `
  query CreditsSummary {
    credits {
      summary {
        remaining
        used
        total
        availablePercent
        renewalAt
        planId
      }
    }
  }
`;

export const BILLING_PAGE_QUERY = `
  query BillingPage($after: String) {
    billing {
      subscription {
        planName
        status
        currentPeriodEnd
        nextInvoiceAmount
      }
      invoices(first: 20, after: $after) {
        edges {
          node {
            id
            issuedAt
            amountCents
            status
            description
            currency
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    credits {
      summary {
        remaining
        used
      }
    }
  }
`;

export const CALL_LOGS_PAGE_QUERY = `
  query CallLogsPage($after: String, $filter: CallLogFilter) {
    callLogs {
      connection(first: 20, after: $after, filter: $filter) {
        edges {
          node {
            id
            startedAt
            direction
            status
            durationSeconds
            leadId
            aiAgentId
            lead {
              id
              firstName
              lastName
            }
            aiAgent {
              id
              name
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const HOME_DASHBOARD_QUERY = `
  query HomeDashboard {
    credits {
      summary {
        remaining
        used
        availablePercent
        renewalAt
      }
    }
    callLogs {
      recent(limit: 10) {
        id
        startedAt
        direction
        status
        durationSeconds
        lead {
          firstName
          lastName
        }
      }
    }
    analytics {
      summary(granularity: DAILY) {
        totalCalls
        connectedCalls
        conversionRate
      }
    }
    agents {
      statusSummary {
        active
        inactive
        total
      }
    }
  }
`;

export type CreditsSummaryResult = {
  credits: {
    summary: {
      remaining: number;
      used: number;
      total: number;
      availablePercent: number;
      renewalAt: string | null;
      planId: string | null;
    };
  };
};

export type BillingPageResult = {
  billing: {
    subscription: {
      planName: string;
      status: string;
      currentPeriodEnd: string;
      nextInvoiceAmount: number | null;
    } | null;
    invoices: {
      edges: {
        node: {
          id: string;
          issuedAt: string;
          amountCents: number;
          status: string;
          description: string | null;
          currency: string;
        };
        cursor: string;
      }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
  credits: { summary: { remaining: number; used: number } };
};

export type CallLogsPageResult = {
  callLogs: {
    connection: {
      edges: {
        node: {
          id: string;
          startedAt: string;
          direction: string;
          status: string;
          durationSeconds: number;
          leadId: string | null;
          aiAgentId: string | null;
          lead: { id: string; firstName: string | null; lastName: string | null } | null;
          aiAgent: { id: string; name: string } | null;
        };
        cursor: string;
      }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
};

export type HomeDashboardResult = {
  credits: CreditsSummaryResult["credits"];
  callLogs: {
    recent: {
      id: string;
      startedAt: string;
      direction: string;
      status: string;
      durationSeconds: number;
      lead: { firstName: string | null; lastName: string | null } | null;
    }[];
  };
  analytics: {
    summary: {
      totalCalls: number;
      connectedCalls: number;
      conversionRate: number;
    };
  };
  agents: {
    statusSummary: { active: number; inactive: number; total: number };
  };
};
