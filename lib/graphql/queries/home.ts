export const HOME_PAGE_QUERY = `
  query HomePage {
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
        generatedLeads
        periodStart
        periodEnd
      }
    }
    agents {
      statusSummary {
        active
        inactive
        total
      }
    }
    leads {
      temperatureBreakdown {
        hot
        warm
        cold
        total
      }
    }
    campaigns {
      list {
        id
        name
        status
        agentId
        agentName
        totalCalls
        connectedCalls
        conversionRate
        generatedLeads
        createdAt
      }
    }
    scheduler {
      upcoming(limit: 5) {
        id
        type
        title
        startAt
        status
      }
    }
    events {
      recent(limit: 10) {
        id
        type
        title
        entityType
        entityId
        createdAt
      }
    }
    notifications {
      list(first: 5) {
        edges {
          node {
            id
            type
            title
            body
            createdAt
          }
        }
      }
    }
  }
`;

export type HomePageResult = {
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
      generatedLeads: number;
      periodStart: string | null;
      periodEnd: string | null;
    };
  };
  agents: {
    statusSummary: { active: number; inactive: number; total: number };
  };
  leads: {
    temperatureBreakdown: {
      hot: number;
      warm: number;
      cold: number;
      total: number;
    };
  };
  campaigns: {
    list: {
      id: string;
      name: string;
      status: string;
      agentId: string | null;
      agentName: string;
      totalCalls: number;
      connectedCalls: number;
      conversionRate: number;
      generatedLeads: number;
      createdAt: string;
    }[];
  };
  scheduler: {
    upcoming: {
      id: string;
      type: string;
      title: string;
      startAt: string;
      status: string;
    }[];
  };
  events: {
    recent: {
      id: string;
      type: string;
      title: string;
      entityType: string | null;
      entityId: string | null;
      createdAt: string;
    }[];
  };
  notifications: {
    list: {
      edges: {
        node: {
          id: string;
          type: string;
          title: string;
          body: string;
          createdAt: string;
        };
      }[];
    };
  };
};
