"use client";

import { usePathname } from "next/navigation";

import { PermissionsProvider } from "@/components/permissions/permissions-provider";
import { AppSidebar } from "@/components/common/app-sidebar";
import { ContractGate } from "@/components/common/contract-gate";
import { ContractStatusProvider } from "@/components/common/contract-status-provider";
import { CreditsSync } from "@/components/common/credits-sync";
import { SideNotificationProvider } from "@/components/common/side-notification";
import { TopNav } from "@/components/common/top-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** Routes that stay accessible without a linked Contract ID. */
const UNGATED_PREFIXES = [
  "/settings",
  "/setup",
  "/how-it-works",
  "/unauthorized",
];

function isUngatedPath(pathname: string) {
  return UNGATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ungated = isUngatedPath(pathname);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <PermissionsProvider>
        <SideNotificationProvider>
          <ContractStatusProvider>
            <CreditsSync />
            <AppSidebar />
            <SidebarInset className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
              <TopNav />
              <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {ungated ? children : <ContractGate>{children}</ContractGate>}
              </main>
            </SidebarInset>
          </ContractStatusProvider>
        </SideNotificationProvider>
      </PermissionsProvider>
    </SidebarProvider>
  );
}
