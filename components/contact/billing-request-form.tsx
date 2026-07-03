"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";

import { submitBillingContactRequest } from "@/actions/billing-contact";
import { QuantityStepper } from "@/components/billing/quantity-stepper";
import { useSideNotification } from "@/components/common/side-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BILLING_CONTACT_INTENTS,
  BILLING_SUPPORT_EMAIL,
  buildBillingContactMailto,
  estimateBillingContactTotal,
  getBillingContactIntentMeta,
  parseBillingContactIntent,
  type BillingContactIntent,
} from "@/lib/billing-contact";
import { formatInr } from "@/lib/billing-pricing";
import { getUserMetadata } from "@/lib/user-metadata";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";

type BillingRequestFormProps = {
  className?: string;
};

export function BillingRequestForm({ className }: BillingRequestFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const viewer = useSettingsStore((s) => s.viewer);
  const { notify } = useSideNotification();

  const initialIntent = parseBillingContactIntent(searchParams.get("intent"));
  const [intent, setIntent] = useState<BillingContactIntent>(initialIntent);
  const [quantity, setQuantity] = useState(
    () => getBillingContactIntentMeta(initialIntent).defaultQuantity,
  );
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null,
  );

  const metadata = getUserMetadata(
    user?.unsafeMetadata as Record<string, unknown> | undefined,
  );
  const meta = getBillingContactIntentMeta(intent);
  const estimatedTotal = useMemo(
    () => estimateBillingContactTotal(intent, quantity),
    [intent, quantity],
  );

  const contactName =
    user?.fullName ??
    [viewer?.firstName, viewer?.lastName].filter(Boolean).join(" ") ??
    "Account";
  const email =
    viewer?.email ?? user?.primaryEmailAddress?.emailAddress ?? "";
  const companyName =
    viewer?.company.name ?? metadata.companyName ?? "Your company";

  useEffect(() => {
    const nextIntent = parseBillingContactIntent(searchParams.get("intent"));
    setIntent(nextIntent);
    setQuantity(getBillingContactIntentMeta(nextIntent).defaultQuantity);
    setSubmittedRequestId(null);
  }, [searchParams]);

  useEffect(() => {
    const defaultPhone =
      metadata.phone ??
      user?.primaryPhoneNumber?.phoneNumber ??
      user?.phoneNumbers?.[0]?.phoneNumber ??
      "";
    setPhone(defaultPhone.replace(/\s+/g, " ").trim());
  }, [metadata.phone, user]);

  function handleIntentChange(nextIntent: BillingContactIntent) {
    setIntent(nextIntent);
    setQuantity(getBillingContactIntentMeta(nextIntent).defaultQuantity);
    setSubmittedRequestId(null);

    const params = new URLSearchParams(searchParams.toString());
    params.set("intent", nextIntent);
    router.replace(`/contact?${params.toString()}`, { scroll: false });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitBillingContactRequest({
        intent,
        quantity,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        notify({ type: "error", message: result.error });
        return;
      }

      setSubmittedRequestId(result.requestId);
      notify({
        type: "success",
        message: "Your billing request was submitted successfully.",
      });
    } catch (error) {
      notify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedRequestId) {
    const mailto = buildBillingContactMailto({
      intent,
      quantity,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      companyName,
      contactName,
      email,
      requestId: submittedRequestId,
    });

    return (
      <div
        className={cn(
          "rounded-xl border border-propnex-border bg-propnex-panel p-6",
          className,
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Request submitted
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-propnex-muted">
          Our billing team received your {meta.label.toLowerCase()} request.
          We typically respond within one business day with a quote and
          provisioning timeline.
        </p>

        <dl className="mt-5 space-y-3 rounded-lg border border-propnex-border bg-propnex-bg/60 p-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-propnex-muted">Reference</dt>
            <dd className="font-mono text-xs text-foreground">
              {submittedRequestId}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-propnex-muted">Request</dt>
            <dd className="text-right text-foreground">
              {quantity.toLocaleString("en-IN")} {meta.label.toLowerCase()}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-propnex-muted">Estimated total</dt>
            <dd className="text-right font-medium text-foreground">
              {formatInr(estimatedTotal)}
              <span className="block text-xs font-normal text-propnex-muted">
                excl. GST
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            nativeButton={false}
            render={
              <a href={mailto} className="inline-flex items-center gap-2" />
            }
          >
            <Mail className="size-4" />
            Email billing team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn(
        "rounded-xl border border-propnex-border bg-propnex-panel p-6",
        className,
      )}
    >
      <div className="flex flex-wrap gap-2">
        {BILLING_CONTACT_INTENTS.map((option) => {
          const optionMeta = getBillingContactIntentMeta(option);
          const isActive = intent === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleIntentChange(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-propnex-accent bg-propnex-accent/10 text-foreground"
                  : "border-propnex-border text-propnex-muted hover:border-propnex-accent/40 hover:text-foreground",
              )}
            >
              {optionMeta.label}
            </button>
          );
        })}
      </div>

      <h2 className="mt-5 text-lg font-semibold text-foreground">
        {meta.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-propnex-muted">
        {meta.description}
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {meta.quantityLabel}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={meta.minQuantity}
              max={intent === "credits" ? 500_000 : 500}
            />
            <p className="text-sm text-propnex-muted">{meta.quantityHint}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="billing-contact-name"
              className="text-sm font-medium text-foreground"
            >
              Contact name
            </label>
            <Input
              id="billing-contact-name"
              value={contactName}
              readOnly
              className="border-propnex-border bg-propnex-bg/70"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="billing-contact-email"
              className="text-sm font-medium text-foreground"
            >
              Work email
            </label>
            <Input
              id="billing-contact-email"
              type="email"
              value={email}
              readOnly
              className="border-propnex-border bg-propnex-bg/70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="billing-contact-phone"
            className="text-sm font-medium text-foreground"
          >
            Phone <span className="text-propnex-muted">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
            <Input
              id="billing-contact-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+91 98765 43210"
              className="border-propnex-border bg-propnex-bg pl-9"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="billing-contact-notes"
            className="text-sm font-medium text-foreground"
          >
            Additional details <span className="text-propnex-muted">(optional)</span>
          </label>
          <textarea
            id="billing-contact-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Share campaign timelines, PO requirements, or anything else we should know."
            className="w-full resize-none rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-propnex-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-propnex-muted">Estimated total</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {formatInr(estimatedTotal)}
          </p>
          <p className="text-xs text-propnex-muted">excl. 18% GST</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/billing" className="inline-flex items-center gap-2" />
            }
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit request"
            )}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-propnex-muted">
        Prefer email? Reach us directly at{" "}
        <a
          href={`mailto:${BILLING_SUPPORT_EMAIL}`}
          className="text-propnex-accent underline-offset-2 hover:underline"
        >
          {BILLING_SUPPORT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
