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
  ANALYTICS_WRITE: "analytics:write",
  INTEGRATIONS_READ: "integrations:read",
  INTEGRATIONS_WRITE: "integrations:write",
  NOTIFICATIONS_READ: "notifications:read",
  EVENTS_READ: "events:read",
  SCHEDULER_READ: "scheduler:read",
  SCHEDULER_WRITE: "scheduler:write",
  SETTINGS_WRITE: "settings:write",
  BRANCHES_READ: "branches:read",
  BRANCHES_WRITE: "branches:write",
  BRANCHES_BULK: "branches:bulk",
  DOCUMENTS_READ: "documents:read",
  DOCUMENTS_WRITE: "documents:write",
  EMPLOYEES_READ: "employees:read",
  EMPLOYEES_WRITE: "employees:write",
  EMPLOYEES_INVITE: "employees:invite",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const MANAGER_PERMISSIONS: Permission[] = [
  PERMISSIONS.BILLING_READ,
  PERMISSIONS.CREDITS_READ,
  PERMISSIONS.CALL_LOGS_READ,
  PERMISSIONS.CALL_LOGS_WRITE,
  PERMISSIONS.AGENTS_READ,
  PERMISSIONS.AGENTS_WRITE,
  PERMISSIONS.LEADS_READ,
  PERMISSIONS.LEADS_WRITE,
  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.ANALYTICS_WRITE,
  PERMISSIONS.INTEGRATIONS_READ,
  PERMISSIONS.NOTIFICATIONS_READ,
  PERMISSIONS.EVENTS_READ,
  PERMISSIONS.SCHEDULER_READ,
  PERMISSIONS.SCHEDULER_WRITE,
  PERMISSIONS.BRANCHES_READ,
  PERMISSIONS.BRANCHES_WRITE,
  PERMISSIONS.DOCUMENTS_READ,
  PERMISSIONS.DOCUMENTS_WRITE,
  PERMISSIONS.EMPLOYEES_READ,
];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: Object.values(PERMISSIONS).filter(
    (p) => p !== PERMISSIONS.SETTINGS_WRITE && p !== PERMISSIONS.BRANCHES_BULK,
  ),
  MANAGER: MANAGER_PERMISSIONS,
  SALES: [
    PERMISSIONS.CALL_LOGS_READ,
    PERMISSIONS.CALL_LOGS_WRITE,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_WRITE,
    PERMISSIONS.BRANCHES_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.EVENTS_READ,
  ],
  SUPPORT: [
    PERMISSIONS.CALL_LOGS_READ,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.BRANCHES_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.EVENTS_READ,
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
    PERMISSIONS.BRANCHES_READ,
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  AGENT: "Agent",
  SALES: "Sales",
  SUPPORT: "Support",
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

export function getPermissionLabels(): Record<Permission, string> {
  return {
    [PERMISSIONS.BILLING_READ]: "View Billing",
    [PERMISSIONS.BILLING_WRITE]: "Manage Billing",
    [PERMISSIONS.CREDITS_READ]: "View Credits",
    [PERMISSIONS.CREDITS_WRITE]: "Manage Credits",
    [PERMISSIONS.CALL_LOGS_READ]: "View Calls",
    [PERMISSIONS.CALL_LOGS_WRITE]: "Manage Calls",
    [PERMISSIONS.AGENTS_READ]: "View AI Agents",
    [PERMISSIONS.AGENTS_WRITE]: "Manage AI Agents",
    [PERMISSIONS.LEADS_READ]: "View Contacts",
    [PERMISSIONS.LEADS_WRITE]: "Manage Contacts",
    [PERMISSIONS.ANALYTICS_READ]: "View Analytics",
    [PERMISSIONS.ANALYTICS_WRITE]: "Manage Analytics",
    [PERMISSIONS.INTEGRATIONS_READ]: "View Integrations",
    [PERMISSIONS.INTEGRATIONS_WRITE]: "Manage Integrations",
    [PERMISSIONS.NOTIFICATIONS_READ]: "View Notifications",
    [PERMISSIONS.EVENTS_READ]: "View Events",
    [PERMISSIONS.SCHEDULER_READ]: "View Scheduler",
    [PERMISSIONS.SCHEDULER_WRITE]: "Manage Scheduler",
    [PERMISSIONS.SETTINGS_WRITE]: "Manage Settings",
    [PERMISSIONS.BRANCHES_READ]: "View Branches",
    [PERMISSIONS.BRANCHES_WRITE]: "Manage Branches",
    [PERMISSIONS.BRANCHES_BULK]: "Bulk Branch Actions",
    [PERMISSIONS.DOCUMENTS_READ]: "View Documents",
    [PERMISSIONS.DOCUMENTS_WRITE]: "Manage Documents",
    [PERMISSIONS.EMPLOYEES_READ]: "View Employees",
    [PERMISSIONS.EMPLOYEES_WRITE]: "Manage Employees",
    [PERMISSIONS.EMPLOYEES_INVITE]: "Invite Employees",
  };
}
