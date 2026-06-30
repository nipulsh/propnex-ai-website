"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { claimOnboarding } from "@/actions/onboarding";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";

export function OnboardingCompleteClient() {
  const router = useRouter();
  const { session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function runClaim() {
      setIsClaiming(true);
      setError(null);

      const result = await claimOnboarding();
      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setIsClaiming(false);
        return;
      }

      await session?.reload();
      router.replace("/dashboard");
    }

    void runClaim();

    return () => {
      cancelled = true;
    };
  }, [router, session]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <BrandLogo />
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {isClaiming ? (
          <>
            <Loader2 className="mb-4 size-8 animate-spin text-propnex-accent" />
            <h1 className="text-xl font-semibold text-foreground">
              Setting up your account…
            </h1>
            <p className="mt-2 text-sm text-propnex-muted">
              Linking your company and preparing your dashboard.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Setup could not be completed
            </h1>
            <p className="mt-2 text-sm text-destructive">{error}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button render={<Link href="/onboarding" />}>Back to onboarding</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
