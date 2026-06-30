"use client";

import { useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContractSignUp() {
  const [email, setEmail] = useState("");
  const [validatedEmail, setValidatedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleEmailCheck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/signup/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = (await response.json()) as {
        error?: string;
        available?: boolean;
      };

      if (!response.ok) {
        setError(
          data.error ??
            "This email cannot be used for signup. Please try another email address.",
        );
        return;
      }

      setValidatedEmail(trimmedEmail);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  if (validatedEmail) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border px-6 py-4">
          <BrandLogo />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <SignUp
            forceRedirectUrl="/onboarding/complete"
            initialValues={{ emailAddress: validatedEmail }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <BrandLogo />
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-propnex-muted">
            Enter your work email to continue. Each email can only be linked to
            one company.
          </p>
        </div>

        <form
          onSubmit={(event) => void handleEmailCheck(event)}
          className="space-y-4 rounded-2xl border border-propnex-border bg-propnex-panel p-6"
        >
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm text-propnex-muted">
              Email address
            </label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isChecking} className="w-full gap-2">
            {isChecking ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Checking email…
              </>
            ) : (
              "Continue to sign up"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-propnex-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-propnex-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
