"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, Building2, Phone, Target } from "lucide-react";

import { completeOnboarding } from "@/actions/onboarding";

import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CallVolumeRange, PrimaryUseCase } from "@/lib/user-metadata";
import { useOnboardingStore } from "@/stores/onboarding-store";

const USE_CASE_OPTIONS: { value: PrimaryUseCase; label: string }[] = [
  { value: PrimaryUseCase.LEAD_QUALIFICATION, label: "Lead Qualification" },
  { value: PrimaryUseCase.CUSTOMER_SUPPORT, label: "Customer Support" },
  { value: PrimaryUseCase.APPOINTMENT_BOOKING, label: "Appointment Booking" },
];

const CALL_VOLUME_OPTIONS: { value: CallVolumeRange; label: string }[] = [
  { value: CallVolumeRange.RANGE_1_100, label: "1–100" },
  { value: CallVolumeRange.RANGE_100_500, label: "100–500" },
  { value: CallVolumeRange.RANGE_500_1000, label: "500–1000" },
  { value: CallVolumeRange.RANGE_1000_PLUS, label: "1000+" },
];

const STEPS = [
  { id: 1, title: "Company", icon: Building2 },
  { id: 2, title: "Use Case", icon: Target },
  { id: 3, title: "Call Volume", icon: Phone },
];

function OptionCard({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left text-sm font-medium transition-colors",
        selected
          ? "border-propnex-accent bg-propnex-accent/10 text-foreground"
          : "border-propnex-border bg-propnex-panel text-foreground hover:border-propnex-accent/40",
      )}
    >
      {label}
    </button>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const { session } = useSession();
  const step = useOnboardingStore((s) => s.step);
  const companyName = useOnboardingStore((s) => s.companyName);
  const phone = useOnboardingStore((s) => s.phone);
  const primaryUseCase = useOnboardingStore((s) => s.primaryUseCase);
  const callVolume = useOnboardingStore((s) => s.callVolume);
  const isSubmitting = useOnboardingStore((s) => s.isSubmitting);
  const setStep = useOnboardingStore((s) => s.setStep);
  const setCompanyName = useOnboardingStore((s) => s.setCompanyName);
  const setPhone = useOnboardingStore((s) => s.setPhone);
  const setPrimaryUseCase = useOnboardingStore((s) => s.setPrimaryUseCase);
  const setCallVolume = useOnboardingStore((s) => s.setCallVolume);
  const setIsSubmitting = useOnboardingStore((s) => s.setIsSubmitting);

  const canContinue =
    (step === 1 && companyName.trim().length > 0) ||
    (step === 2 && primaryUseCase !== null) ||
    (step === 3 && callVolume !== null);

  async function handleComplete() {
    if (!primaryUseCase || !callVolume) {
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding({
        companyName: companyName.trim(),
        phone: phone.trim(),
        primaryUseCase,
        callVolume,
      });
      await session?.reload();
      router.replace("/dashboard");
    } catch (error) {
      console.error("Onboarding completion failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    void handleComplete();
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
            Tell us about your business so we can tailor your experience.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-medium",
                step >= s.id
                  ? "bg-propnex-accent text-propnex-bg"
                  : "bg-propnex-border text-propnex-muted",
              )}
            >
              {s.id}
            </div>
          ))}
        </div>

        <div className="space-y-6 rounded-2xl border border-propnex-border bg-propnex-panel p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Company Information
                </h2>
                <p className="mt-1 text-sm text-propnex-muted">
                  What is your company name?
                </p>
              </div>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Realty"
                className="w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none focus:border-propnex-accent"
              />
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-foreground"
                >
                  Phone Number (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none focus:border-propnex-accent"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Primary Use Case
                </h2>
                <p className="mt-1 text-sm text-propnex-muted">
                  What is the primary purpose of PropNex AI?
                </p>
              </div>
              <div className="grid gap-3">
                {USE_CASE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={primaryUseCase === option.value}
                    onClick={() => setPrimaryUseCase(option.value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Call Volume
                </h2>
                <p className="mt-1 text-sm text-propnex-muted">
                  How many calls do you make per day?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CALL_VOLUME_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={callVolume === option.value}
                    onClick={() => setCallVolume(option.value)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

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
            onClick={handleNext}
            disabled={!canContinue || isSubmitting}
            className="gap-2"
          >
            {step === 3 ? (isSubmitting ? "Saving…" : "Get Started") : "Continue"}
            {step < 3 ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
