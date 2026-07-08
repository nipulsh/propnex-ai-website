"use client";

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/common/brand-logo";
import { useSidebarNavigation } from "@/components/common/sidebar-navigation-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { footerNavItems, mainNavItems } from "@/lib/navigation";
import type { Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { isNavigating, navigatingTo, navigateTo } = useSidebarNavigation();
  const isCollapsed = state === "collapsed";
  const { hasPermission, isLoading, role, branchAccessType } = usePermissions();

  const isBranchAdmin = !isLoading && role === "ADMIN" && branchAccessType === "SELECTED";

  const visibleNavItems = mainNavItems.filter((item) => {
    if (isBranchAdmin) {
      return item.href === "/dashboard" || item.href === "/call-logs" || item.href === "/contact";
    }
    // Hide Contact Us for regular users (it is accessed from Settings or footer)
    if (item.href === "/contact") {
      return false;
    }
    return (
      !item.permission ||
      (!isLoading && hasPermission(item.permission as Permission))
    );
  });

  const visibleFooterItems = footerNavItems.filter(() => {
    if (isBranchAdmin) {
      return false;
    }
    return true;
  });

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavigate = (href: string) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigateTo(href);
  };

  const renderNavButton = (
    item: (typeof visibleNavItems)[number] | (typeof visibleFooterItems)[number],
    options?: { activeClassName?: string },
  ) => {
    const active = isActive(item.href);
    const isTarget = navigatingTo === item.href;

    return (
      <SidebarMenuButton
        type="button"
        onClick={() => handleNavigate(item.href)}
        disabled={isNavigating}
        isActive={active}
        tooltip={item.title}
        className={cn(
          "h-9 rounded-lg",
          active && "bg-sidebar-accent font-medium",
          active && !isCollapsed && options?.activeClassName,
          isNavigating && "cursor-not-allowed",
        )}
      >
        {isTarget ? (
          <Loader2 className="animate-spin" />
        ) : (
          <item.icon />
        )}
        <span>{item.title}</span>
      </SidebarMenuButton>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader
        className={cn(
          "p-4",
          isCollapsed && "flex items-center justify-center p-2",
        )}
      >
        <BrandLogo showText={!isCollapsed} size={isCollapsed ? "sm" : "md"} />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {renderNavButton(item, {
                    activeClassName:
                      "border-l-2 border-primary pl-[calc(0.5rem-2px)]",
                  })}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {visibleFooterItems.length > 0 && (
        <SidebarFooter className="px-2 pb-4 group-data-[collapsible=icon]:px-0">
          <SidebarSeparator className="mb-2 group-data-[collapsible=icon]:hidden" />
          <SidebarMenu>
            {visibleFooterItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {renderNavButton(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
