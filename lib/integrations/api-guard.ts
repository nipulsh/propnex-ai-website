import { requireTenantPermission } from "@/lib/api/tenant-context";
import { PERMISSIONS } from "@/lib/permissions";

export function requireIntegrationsRead() {
  return requireTenantPermission(PERMISSIONS.INTEGRATIONS_READ);
}

export function requireIntegrationsWrite() {
  return requireTenantPermission(PERMISSIONS.INTEGRATIONS_WRITE);
}

export function requireAgentsRead() {
  return requireTenantPermission(PERMISSIONS.AGENTS_READ);
}

export function requireAgentsWrite() {
  return requireTenantPermission(PERMISSIONS.AGENTS_WRITE);
}
