"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/common/brand-logo";
import { fetchViewerRole } from "@/lib/graphql/api";
import { footerNavItems, mainNavItems } from "@/lib/navigation";
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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchViewerRole()
      .then((res) => setPermissions(res.viewer.permissions ?? []))
      .catch(() => setPermissions([]));
  }, []);

  const visibleNavItems = mainNavItems.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
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
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className={cn(
                      "h-9 rounded-lg",
                      isActive(item.href) &&
                        "bg-sidebar-accent font-medium",
                      isActive(item.href) &&
                        !isCollapsed &&
                        "border-l-2 border-primary pl-[calc(0.5rem-2px)]",
                    )}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4 group-data-[collapsible=icon]:px-0">
        <SidebarSeparator className="mb-2 group-data-[collapsible=icon]:hidden" />
        <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={isActive(item.href)}
                tooltip={item.title}
                className="h-9 rounded-lg"
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
