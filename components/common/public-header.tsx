"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { BrandLogo } from "@/components/common/brand-logo";
import { ModeToggle } from "@/components/common/mode-toggle";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <BrandLogo />
        </Link>

        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            Pricing
          </Button>
          <ModeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/onboarding" />}
            >
              Get started
            </Button>
          </Show>
          <Show when="signed-in">
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Dashboard
            </Button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8",
                },
              }}
            />
          </Show>
        </nav>
      </div>
    </header>
  );
}
