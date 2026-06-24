"use client";

import { AppSidebar } from "@/components/common/app-sidebar";
import { CreditsSync } from "@/components/common/credits-sync";
import { SideNotificationProvider } from "@/components/common/side-notification";
import { TopNav } from "@/components/common/top-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <SideNotificationProvider>
        <CreditsSync />
        <AppSidebar />
        <SidebarInset className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
          <TopNav />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </SidebarInset>
      </SideNotificationProvider>
    </SidebarProvider>
  );
}
