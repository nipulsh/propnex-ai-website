import type { Permission } from "@/lib/permissions";

export type RoutePermissionRule = {
  pattern: RegExp;
  permission?: Permission;
};

/** First matching rule wins. Permission undefined = authenticated members only. */
export const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  { pattern: /^\/unauthorized\/?$/, permission: undefined },
  { pattern: /^\/dashboard\/?$/, permission: undefined },
  { pattern: /^\/settings\/?$/, permission: undefined },
  { pattern: /^\/how-it-works\/?$/, permission: undefined },
  { pattern: /^\/setup\/?$/, permission: "integrations:read" },
  { pattern: /^\/tools\/?$/, permission: "integrations:read" },
  { pattern: /^\/branches(\/|$)/, permission: "branches:read" },
  { pattern: /^\/employees(\/|$)/, permission: "employees:read" },
  {
    pattern: /^\/agents\/create\/?$/,
    permission: "agents:write",
  },
  {
    pattern: /^\/agents\/[^/]+\/edit\/?$/,
    permission: "agents:write",
  },
  {
    pattern: /^\/agents\/library\/[^/]+\/deploy\/?$/,
    permission: "agents:write",
  },
  { pattern: /^\/agents(\/|$)/, permission: "agents:read" },
  { pattern: /^\/call-logs(\/|$)/, permission: "call_logs:read" },
  { pattern: /^\/phone-numbers(\/|$)/, permission: "agents:read" },
  { pattern: /^\/billing\/?$/, permission: "billing:read" },
  { pattern: /^\/contact\/?$/, permission: "billing:read" },
  { pattern: /^\/lead-reactivation\/?$/, permission: "analytics:read" },
];

export function getRequiredPermissionForPath(
  pathname: string,
): Permission | undefined | null {
  for (const rule of ROUTE_PERMISSION_RULES) {
    if (rule.pattern.test(pathname)) {
      return rule.permission ?? null;
    }
  }
  return null;
}
