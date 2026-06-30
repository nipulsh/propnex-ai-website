"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileKey2,
  Loader2,
  LogIn,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const STEPS = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Contract ID", icon: FileKey2 },
  { id: 3, title: "Create Account", icon: UserPlus },
];

export function OnboardingWizard() {
  const router = useRouter();
  const step = useOnboardingStore((state) => state.step);
  const contractId = useOnboardingStore((state) => state.contractId);
  const companyName = useOnboardingStore((state) => state.companyName);
  const validationState = useOnboardingStore((state) => state.validationState);
  const validationError = useOnboardingStore((state) => state.validationError);
  const isSubmitting = useOnboardingStore((state) => state.isSubmitting);
  const setStep = useOnboardingStore((state) => state.setStep);
  const setContractId = useOnboardingStore((state) => state.setContractId);
  const setCompanyName = useOnboardingStore((state) => state.setCompanyName);
  const setValidationState = useOnboardingStore(
    (state) => state.setValidationState,
  );
  const setValidationError = useOnboardingStore(
    (state) => state.setValidationError,
  );
  const setIsSubmitting = useOnboardingStore((state) => state.setIsSubmitting);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canContinue =
    step === 1 ||
    (step === 2 && contractId.trim().length > 0) ||
    (step === 3 && validationState === "valid");

  async function validateContractId() {
    const normalized = contractId.trim().toUpperCase();
    if (!normalized) {
      setValidationState("invalid");
      setValidationError("Please enter your Contract ID.");
      return false;
    }

    setIsSubmitting(true);
    setValidationState("validating");
    setValidationError(null);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contract-id/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: normalized }),
      });

      const data = (await response.json()) as {
        error?: string;
        companyName?: string;
      };

      if (response.status === 409) {
        setValidationState("claimed");
        setValidationError(
          data.error ?? "This Contract ID has already been claimed.",
        );
        return false;
      }

      if (!response.ok) {
        setValidationState(response.status === 400 ? "invalid" : "error");
        setValidationError(
          data.error ??
            (response.status === 400
              ? "Invalid Contract ID."
              : "An unexpected error occurred. Please try again."),
        );
        return false;
      }

      setContractId(normalized);
      setCompanyName(data.companyName ?? null);
      setValidationState("valid");
      return true;
    } catch {
      setValidationState("error");
      setValidationError("An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNext() {
    if (step === 2) {
      const isValid =
        validationState === "valid" ? true : await validateContractId();
      if (!isValid) {
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      router.push("/sign-up");
      return;
    }

    setStep(step + 1);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <BrandLogo />
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome to PropNex AI
          </h1>
          <p className="mt-2 text-sm text-propnex-muted">
            Activate your company account to get started.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((currentStep) => (
            <div
              key={currentStep.id}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-medium",
                step >= currentStep.id
                  ? "bg-propnex-accent text-propnex-bg"
                  : "bg-propnex-border text-propnex-muted",
              )}
            >
              {currentStep.id}
            </div>
          ))}
        </div>

        <div className="space-y-6 rounded-2xl border border-propnex-border bg-propnex-panel p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Get started with PropNex
                </h2>
                <p className="mt-1 text-sm text-propnex-muted">
                  Your admin will share a unique Contract ID after your company
                  setup is complete. You&apos;ll use it once to create your
                  account and access your dashboard.
                </p>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-propnex-muted">
                <li>Enter your Contract ID</li>
                <li>Create your account with Clerk</li>
                <li>Verify your email and access your dashboard</li>
              </ul>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Enter Contract ID
                </h2>
                <p className="mt-1 text-sm text-propnex-muted">
                  Enter the 10-character code provided by your PropNex admin.
                </p>
              </div>
              <input
                id="contract-id"
                type="text"
                value={contractId}
                onChange={(event) => setContractId(event.target.value)}
                placeholder="7KQ9A4XZP2"
                className="w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 font-mono text-sm uppercase tracking-widest text-foreground outline-none focus:border-propnex-accent"
                autoComplete="off"
                spellCheck={false}
              />
              {validationState === "validating" ? (
                <p className="flex items-center gap-2 text-sm text-propnex-muted">
                  <Loader2 className="size-4 animate-spin" />
                  Validating Contract ID…
                </p>
              ) : null}
              {validationState === "valid" && companyName ? (
                <p className="text-sm text-propnex-accent">
                  Valid for company: {companyName}
                </p>
              ) : null}
              {validationError ? (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {validationError}
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Create your account
                </h2>
                <p className="mt-1 text-sm text-propnex-muted">
                  {companyName
                    ? `You're activating ${companyName}. Continue to create your account and verify your email.`
                    : "Continue to create your account and verify your email."}
                </p>
              </div>
              <p className="text-sm text-propnex-muted">
                Your Contract ID has been validated and will be linked
                automatically after signup.
              </p>
            </div>
          ) : null}
        </div>

        {submitError ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {submitError}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            onClick={() => void handleNext()}
            disabled={!canContinue || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Please wait…
              </>
            ) : step === 3 ? (
              "Continue to sign up"
            ) : step === 2 ? (
              "Validate & continue"
            ) : (
              "Continue"
            )}
            {step < 3 && !isSubmitting ? (
              <ArrowRight className="size-4" />
            ) : null}
          </Button>
        </div>

        <Link
          href="/sign-in"
          className="mt-6 flex items-center justify-between rounded-2xl border border-propnex-border bg-propnex-panel p-4 transition-colors hover:border-propnex-accent/40 hover:bg-propnex-accent/5"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              Already signed up?
            </p>
            <p className="mt-0.5 text-sm text-propnex-muted">
              Sign in to access your dashboard.
            </p>
          </div>
          <LogIn className="size-5 shrink-0 text-propnex-accent" />
        </Link>
      </div>
    </div>
  );
}
