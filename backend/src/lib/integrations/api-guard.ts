import { requirePermission } from "@/middleware/tenant";
import { PERMISSIONS } from "@/lib/permissions";

export const requireIntegrationsRead = () => requirePermission(PERMISSIONS.INTEGRATIONS_READ);
export const requireIntegrationsWrite = () => requirePermission(PERMISSIONS.INTEGRATIONS_WRITE);
export const requireAgentsRead = () => requirePermission(PERMISSIONS.AGENTS_READ);
export const requireAgentsWrite = () => requirePermission(PERMISSIONS.AGENTS_WRITE);
