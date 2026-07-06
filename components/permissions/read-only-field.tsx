"use client";

import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/lib/permissions";

type ReadOnlyFieldProps = {
  writePermission: Permission;
  label?: string;
  value: ReactNode;
  edit: ReactNode;
};

export function ReadOnlyField({
  writePermission,
  label,
  value,
  edit,
}: ReadOnlyFieldProps) {
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission(writePermission);

  return (
    <div>
      {label ? (
        <p className="text-xs text-propnex-muted">{label}</p>
      ) : null}
      {canWrite ? edit : <div className="text-sm">{value}</div>}
    </div>
  );
}
