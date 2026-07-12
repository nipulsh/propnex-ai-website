"use client";

import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/lib/permissions";

type CanProps = {
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } =
    usePermissions();

  if (isLoading) return null;

  let allowed = false;
  if (permission) {
    allowed = hasPermission(permission);
  } else if (anyOf?.length) {
    allowed = hasAnyPermission(anyOf);
  } else if (allOf?.length) {
    allowed = hasAllPermissions(allOf);
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
