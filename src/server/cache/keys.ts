export const CACHE_TTL = {
  CREDITS: 5 * 60,
  TOP_CALL_LOGS: 2 * 60,
  ANALYTICS: 5 * 60,
  PERMISSIONS: 30 * 60,
  AGENT_STATUS: 60,
} as const;

export const cacheKeys = {
  companyCredits: (companyId: string) => `company:${companyId}:credits`,
  companyTopCallLogs: (companyId: string) =>
    `company:${companyId}:top-call-logs`,
  companyAnalytics: (companyId: string) => `company:${companyId}:analytics`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  companyAgentStatus: (companyId: string) =>
    `company:${companyId}:agent-status`,
};
