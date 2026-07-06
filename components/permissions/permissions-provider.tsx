"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchViewerRole } from "@/lib/graphql/api";
import {
  type Permission,
  type UserRole,
  type BranchAccessType,
} from "@/lib/permissions";
import {
  canAccessBranch,
  canAssignRole,
  canCancelInvitation,
  canDeactivateEmployee,
  canDeleteEmployee,
  canInviteEmployee,
  canManageEmployee,
  canResendInvitation,
  canViewEmployee,
  ctxHasAllPermissions,
  ctxHasAnyPermission,
  ctxHasPermission,
  getAccessibleBranchIds,
  getAssignableRoles,
  type AccessContext,
  type EmployeeTarget,
} from "@/lib/permissions-policy";

export type PermissionsContextValue = {
  isLoading: boolean;
  userId: string | null;
  membershipId: string | null;
  role: UserRole | null;
  permissions: string[];
  branchAccessType: BranchAccessType;
  branchIds: string[];
  access: AccessContext | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessBranch: (branchId: string) => boolean;
  getAccessibleBranchIds: () => string[];
  getAssignableRoles: () => UserRole[];
  canAssignRole: (role: UserRole) => boolean;
  canManageEmployee: (target: EmployeeTarget) => boolean;
  canInviteEmployee: (roleToAssign: UserRole, target?: EmployeeTarget) => boolean;
  canResendInvitation: (target: EmployeeTarget) => boolean;
  canCancelInvitation: (target: EmployeeTarget) => boolean;
  canDeactivateEmployee: (target: EmployeeTarget) => boolean;
  canDeleteEmployee: (target: EmployeeTarget) => boolean;
  canViewEmployee: (target?: EmployeeTarget) => boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

const EMPTY_ACCESS: AccessContext = {
  membershipId: "",
  userId: "",
  role: "AGENT",
  permissions: [],
  branchAccessType: "ALL",
  branchIds: [],
};

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [membershipId, setMembershipId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [branchAccessType, setBranchAccessType] =
    useState<BranchAccessType>("ALL");
  const [branchIds, setBranchIds] = useState<string[]>([]);

  useEffect(() => {
    fetchViewerRole()
      .then((res) => {
        const viewer = res.viewer;
        setUserId(viewer.id);
        setMembershipId(viewer.membershipId);
        setRole(viewer.role as UserRole);
        setPermissions(viewer.permissions ?? []);
        setBranchAccessType(viewer.branchAccessType ?? "ALL");
        setBranchIds(viewer.branchIds ?? []);
      })
      .catch(() => {
        setUserId(null);
        setMembershipId(null);
        setRole(null);
        setPermissions([]);
        setBranchAccessType("ALL");
        setBranchIds([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const access = useMemo<AccessContext | null>(() => {
    if (!membershipId || !userId || !role) return null;
    return {
      membershipId,
      userId,
      role,
      permissions,
      branchAccessType,
      branchIds,
    };
  }, [membershipId, userId, role, permissions, branchAccessType, branchIds]);

  const hasPermissionFn = useCallback(
    (permission: Permission) =>
      access ? ctxHasPermission(access, permission) : false,
    [access],
  );

  const hasAnyPermissionFn = useCallback(
    (perms: Permission[]) =>
      access ? ctxHasAnyPermission(access, perms) : false,
    [access],
  );

  const hasAllPermissionsFn = useCallback(
    (perms: Permission[]) =>
      access ? ctxHasAllPermissions(access, perms) : false,
    [access],
  );

  const value = useMemo<PermissionsContextValue>(
    () => ({
      isLoading,
      userId,
      membershipId,
      role,
      permissions,
      branchAccessType,
      branchIds,
      access,
      hasPermission: hasPermissionFn,
      hasAnyPermission: hasAnyPermissionFn,
      hasAllPermissions: hasAllPermissionsFn,
      canAccessBranch: (branchId) =>
        access ? canAccessBranch(access, branchId) : false,
      getAccessibleBranchIds: () =>
        access ? getAccessibleBranchIds(access) : [],
      getAssignableRoles: () =>
        access ? getAssignableRoles(access) : [],
      canAssignRole: (r) => (access ? canAssignRole(access, r) : false),
      canManageEmployee: (target) =>
        access ? canManageEmployee(access, target) : false,
      canInviteEmployee: (roleToAssign, target) =>
        access ? canInviteEmployee(access, roleToAssign, target) : false,
      canResendInvitation: (target) =>
        access ? canResendInvitation(access, target) : false,
      canCancelInvitation: (target) =>
        access ? canCancelInvitation(access, target) : false,
      canDeactivateEmployee: (target) =>
        access ? canDeactivateEmployee(access, target) : false,
      canDeleteEmployee: (target) =>
        access ? canDeleteEmployee(access, target) : false,
      canViewEmployee: (target) =>
        access ? canViewEmployee(access, target) : false,
    }),
    [
      isLoading,
      userId,
      membershipId,
      role,
      permissions,
      branchAccessType,
      branchIds,
      access,
      hasPermissionFn,
      hasAnyPermissionFn,
      hasAllPermissionsFn,
    ],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissionsContext must be used within PermissionsProvider");
  }
  return ctx;
}

export function usePermissions() {
  return usePermissionsContext();
}

export function useOptionalPermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    return {
      isLoading: true,
      userId: null,
      membershipId: null,
      role: null,
      permissions: [],
      branchAccessType: "ALL",
      branchIds: [],
      access: null,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      canAccessBranch: () => false,
      getAccessibleBranchIds: () => [],
      getAssignableRoles: () => [],
      canAssignRole: () => false,
      canManageEmployee: () => false,
      canInviteEmployee: () => false,
      canResendInvitation: () => false,
      canCancelInvitation: () => false,
      canDeactivateEmployee: () => false,
      canDeleteEmployee: () => false,
      canViewEmployee: () => false,
    };
  }
  return ctx;
}

export { EMPTY_ACCESS };
