"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { CallAiSummary } from "@/components/call-details/call-ai-summary";
import { CallDetailHeader } from "@/components/call-details/call-detail-header";
import { CallDetailOverview } from "@/components/call-details/call-detail-overview";
import { CallDetailSkeleton } from "@/components/call-details/call-detail-skeleton";
import { CallOutcomeSection } from "@/components/call-details/call-outcome-section";
import { CallQualitySection } from "@/components/call-details/call-quality-section";
import { CallRecordingPlayer } from "@/components/call-details/call-recording-player";
import { CallTranscript } from "@/components/call-details/call-transcript";
import { EngagementAnalyticsSection } from "@/components/call-details/engagement-analytics-section";
import { FollowUpRecommendations } from "@/components/call-details/follow-up-recommendations";
import { InternalNotesSection } from "@/components/call-details/internal-notes-section";
import { KeyInsightsSection } from "@/components/call-details/key-insights-section";
import { LeadHistorySection } from "@/components/call-details/lead-history-section";
import { LeadIntelligenceSection } from "@/components/call-details/lead-intelligence-section";
import { LeadReactivationSection } from "@/components/call-details/lead-reactivation-section";
import { QuickActionsPanel } from "@/components/call-details/quick-actions-panel";
import { SentimentAnalysisSection } from "@/components/call-details/sentiment-analysis-section";
import { Button } from "@/components/ui/button";
import { getCallDetail } from "@/lib/call-detail-data";
import { useCallDetailStore } from "@/stores/call-detail-store";

type CallDetailPageContentProps = {
  callId: string;
};

export function CallDetailPageContent({ callId }: CallDetailPageContentProps) {
  const isLoading = useCallDetailStore((s) => s.isLoading);
  const error = useCallDetailStore((s) => s.error);
  const hydrate = useCallDetailStore((s) => s.hydrate);
  const reset = useCallDetailStore((s) => s.reset);
  const setLoading = useCallDetailStore((s) => s.setLoading);
  const setError = useCallDetailStore((s) => s.setError);
  const outcome = useCallDetailStore((s) => s.outcome);

  const detail = useMemo(() => getCallDetail(callId), [callId]);

  useEffect(() => {
    reset();
    setLoading(true);

    const timer = setTimeout(() => {
      if (!detail) {
        setError("Call not found");
        return;
      }
      hydrate(detail);
    }, 300);

    return () => clearTimeout(timer);
  }, [callId, detail, hydrate, reset, setError, setLoading]);

  if (isLoading) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
        <CallDetailSkeleton />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-contain p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">
            Call not found
          </h2>
          <p className="max-w-sm text-sm text-propnex-muted">
            The call record you are looking for does not exist or may have been
            removed.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/call-logs" />}
            className="mt-2"
          >
            Back to Call Logs
          </Button>
        </div>
      </div>
    );
  }

  const detailWithOutcome = outcome ? { ...detail, outcome } : detail;

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <CallDetailHeader detail={detailWithOutcome} />
      <CallAiSummary summary={detail.aiSummary} />
      <CallDetailOverview detail={detailWithOutcome} />

      <QuickActionsPanel variant="mobile" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <CallRecordingPlayer recording={detail.recording} />
          <CallTranscript transcript={detail.transcript} />
          <LeadIntelligenceSection detail={detailWithOutcome} />
          <EngagementAnalyticsSection
            engagement={detail.engagement}
            durationSeconds={detail.durationSeconds}
          />
          <CallQualitySection callQuality={detail.callQuality} />
          <SentimentAnalysisSection sentiment={detail.sentiment} />
          <KeyInsightsSection insights={detail.keyInsights} />
          <CallOutcomeSection />
          <FollowUpRecommendations
            recommendations={detail.followUpRecommendations}
          />
          <LeadReactivationSection />
          <InternalNotesSection />
          <LeadHistorySection history={detail.leadHistory} />
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-6">
            <QuickActionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
