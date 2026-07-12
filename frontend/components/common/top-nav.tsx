"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import { Coins } from "lucide-react";

import { AssistantChatPanel } from "@/components/common/assistant-chat-panel";
import { NavBackLink } from "@/components/common/nav-back-link";
import { ModeToggle } from "@/components/common/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";
import { getNavBackLink } from "@/lib/navigation";
import { useUsageStore } from "@/stores/usage-store";

export function TopNav() {
  const pathname = usePathname();
  const backLink = getNavBackLink(pathname);
  const { isLoaded, user } = useUser();
  const {
    role,
    isLoading: roleLoading,
    branchAccessType,
    companyName,
    branchName,
  } = usePermissions();
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const creditsHydrated = useUsageStore((s) => s.creditsHydrated);

  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName = user?.fullName ?? email ?? "Account";
  const isBranchAdmin =
    !roleLoading && role === "ADMIN" && branchAccessType === "SELECTED";
  const orgLabel = roleLoading
    ? "…"
    : isBranchAdmin
      ? (branchName ?? "…")
      : companyName;

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        {backLink ? <NavBackLink href={backLink.href} label={backLink.label} /> : null}
        <Show when="signed-in">
          {backLink ? (
            <span
              aria-hidden
              className="hidden h-6 w-px shrink-0 bg-propnex-border sm:block"
            />
          ) : null}
          <Link
            href="/settings"
            className="flex min-w-0 items-center gap-3 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-propnex-border hover:bg-propnex-panel/50"
          >
            <Avatar size="sm">
              <AvatarImage src={user?.imageUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {isLoaded ? initials : "…"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-foreground">
                {isLoaded ? (email ?? displayName) : "Loading…"}
              </p>
              {orgLabel ? (
                <p className="truncate text-xs text-propnex-muted">{orgLabel}</p>
              ) : null}
            </div>
          </Link>
        </Show>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <AssistantChatPanel />

        <Show when="signed-in">
          <Link
            href="/billing"
            className="flex items-center gap-2 rounded-lg border border-propnex-border bg-propnex-panel px-3 py-1.5 text-sm transition-colors hover:border-propnex-accent/50"
            title="Available credits"
          >
            <Coins className="size-4 shrink-0 text-propnex-accent" />
            <span className="hidden text-propnex-muted sm:inline">Credits</span>
            <span className="font-semibold text-foreground">
              {creditsHydrated ? remainingCredits.toLocaleString() : "…"}
            </span>
          </Link>
        </Show>

        <Show when="signed-in">
          <SignOutButton>
            <Button variant="outline" size="sm">
              Sign out
            </Button>
          </SignOutButton>
        </Show>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Sign up</Button>
          </SignUpButton>
        </Show>
      </div>
    </header>
  );
}
