import type { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  BILLING_READ: "billing:read",
  BILLING_WRITE: "billing:write",
  CREDITS_READ: "credits:read",
  CREDITS_WRITE: "credits:write",
  CALL_LOGS_READ: "call_logs:read",
  CALL_LOGS_WRITE: "call_logs:write",
  AGENTS_READ: "agents:read",
  AGENTS_WRITE: "agents:write",
  LEADS_READ: "leads:read",
  LEADS_WRITE: "leads:write",
  ANALYTICS_READ: "analytics:read",
  INTEGRATIONS_READ: "integrations:read",
  INTEGRATIONS_WRITE: "integrations:write",
  NOTIFICATIONS_READ: "notifications:read",
  EVENTS_READ: "events:read",
  SCHEDULER_READ: "scheduler:read",
  SCHEDULER_WRITE: "scheduler:write",
  SETTINGS_WRITE: "settings:write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.SETTINGS_WRITE),
  MANAGER: [
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.CREDITS_READ,
    PERMISSIONS.CALL_LOGS_READ,
    PERMISSIONS.CALL_LOGS_WRITE,
    PERMISSIONS.AGENTS_READ,
    PERMISSIONS.AGENTS_WRITE,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.INTEGRATIONS_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.SCHEDULER_READ,
    PERMISSIONS.SCHEDULER_WRITE,
  ],
  AGENT: [
    PERMISSIONS.CREDITS_READ,
    PERMISSIONS.CALL_LOGS_READ,
    PERMISSIONS.AGENTS_READ,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_WRITE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.SCHEDULER_READ,
  ],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function mergePermissions(
  rolePermissions: Permission[],
  customPermissions: string[],
): string[] {
  return [...new Set([...rolePermissions, ...customPermissions])];
}

export function hasPermission(
  permissions: string[],
  required: Permission,
): boolean {
  return permissions.includes(required);
}
