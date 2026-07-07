"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail, Phone } from "lucide-react";

import { useSettingsGraphQL } from "@/hooks/use-settings-graphql";
import { useSettingsStore } from "@/stores/settings-store";
import { useSideNotification } from "@/components/common/side-notification";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitBranchSupportRequest } from "@/actions/support-contact";

export function BranchContactPageContent() {
  useSettingsGraphQL();

  const viewer = useSettingsStore((s) => s.viewer);
  const { notify } = useSideNotification();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  // Prefill name and email when viewer is loaded
  useEffect(() => {
    if (viewer) {
      setName(`${viewer.firstName ?? ""} ${viewer.lastName ?? ""}`.trim());
      setEmail(viewer.email ?? "");
    }
  }, [viewer]);

  const companyPhone = useMemo(() => {
    return viewer?.company?.contact?.phone || "+91 98765 43210";
  }, [viewer]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      notify({ type: "error", message: "Full Name is required." });
      return;
    }
    if (!email.trim()) {
      notify({ type: "error", message: "Email is required." });
      return;
    }
    if (!subject.trim()) {
      notify({ type: "error", message: "Subject is required." });
      return;
    }
    if (!message.trim()) {
      notify({ type: "error", message: "Message is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitBranchSupportRequest({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (!result.success) {
        notify({ type: "error", message: result.error });
        return;
      }

      setSubmittedRequestId(result.requestId);
      notify({
        type: "success",
        message: "Your support query was submitted successfully.",
      });
      // Reset non-prefilled fields
      setSubject("");
      setMessage("");
    } catch (error) {
      notify({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to submit your query.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedRequestId) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
        <PageHeader
          title="Support Request Received"
          description="We have received your support query and our team will get back to you shortly."
        />

        <div className="mx-auto mt-8 max-w-md rounded-xl border border-propnex-border bg-propnex-panel p-6 text-center shadow-lg">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Support query submitted
          </h2>
          <p className="mt-2 text-sm text-propnex-muted">
            Your request has been registered under ID:
          </p>
          <p className="mt-1 font-mono text-xs font-medium text-propnex-accent">
            {submittedRequestId}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => setSubmittedRequestId(null)}>
              Submit Another Query
            </Button>
            <Button variant="outline" render={<Link href="/dashboard" />}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="Contact Us"
        description="Submit a support query or contact our team directly."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        {/* Support Query Form */}
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
          <h3 className="text-base font-semibold text-foreground">Submit a Query</h3>
          <p className="mt-1 text-sm text-propnex-muted">
            Send us a message and we'll respond via email.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="support-name" className="text-xs font-semibold text-propnex-muted uppercase tracking-wider">
                  Full Name
                </label>
                <Input
                  id="support-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="support-email" className="text-xs font-semibold text-propnex-muted uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="support-subject" className="text-xs font-semibold text-propnex-muted uppercase tracking-wider">
                Subject
              </label>
              <Input
                id="support-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is your query about?"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="support-message" className="text-xs font-semibold text-propnex-muted uppercase tracking-wider">
                Query / Message
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Describe your issue or question..."
                className="w-full resize-none rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Mail className="size-4" />
                  Submit Query
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Contact Support Information Card */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Phone className="size-4 text-propnex-accent" />
              Support Hotline
            </h3>
            <p className="mt-2 text-sm text-propnex-muted">
              Call us directly for urgent assistance.
            </p>
            <div className="mt-4">
              <a
                href={`tel:${companyPhone}`}
                className="inline-flex items-center gap-2 text-lg font-bold text-propnex-accent hover:underline"
              >
                {companyPhone}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
