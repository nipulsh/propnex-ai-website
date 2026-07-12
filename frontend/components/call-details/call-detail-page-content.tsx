"use client";

import { useEffect } from "react";

import { CallAiSummary } from "@/components/call-details/call-ai-summary";
import { CallDetailHeader } from "@/components/call-details/call-detail-header";
import { CallDetailOverview } from "@/components/call-details/call-detail-overview";
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
import { useCallDetailGraphQL } from "@/hooks/use-call-detail-graphql";
import { usePageStatusNotification } from "@/hooks/use-page-status-notification";
import { useCallDetailStore } from "@/stores/call-detail-store";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

type CallDetailPageContentProps = {
  callId: string;
};

export function CallDetailPageContent({ callId }: CallDetailPageContentProps) {
  const { role, branchAccessType, isLoading: isPermsLoading } = usePermissions();
  const isBranchAdmin = !isPermsLoading && role === "ADMIN" && branchAccessType === "SELECTED";

  const { detail, isLoading, error, reload } = useCallDetailGraphQL(callId);
  const hydrate = useCallDetailStore((s) => s.hydrate);
  const reset = useCallDetailStore((s) => s.reset);
  const outcome = useCallDetailStore((s) => s.outcome);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading call details…",
    loadingId: "call-detail-loading",
    error: error ?? undefined,
  });

  useEffect(() => {
    reset();
    if (detail) {
      hydrate(detail);
    }
  }, [detail, hydrate, reset]);

  if (!detail && isLoading) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-contain p-6">
        <p className="text-sm text-propnex-muted">Loading call details…</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-contain p-6">
        <p className="text-sm text-propnex-muted">
          {error ?? "Call not found."}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => void reload({ showLoading: true })}
          >
            Retry
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

      {!isBranchAdmin && <QuickActionsPanel variant="mobile" />}

      <div className={cn("grid grid-cols-1 gap-6", !isBranchAdmin && "lg:grid-cols-[1fr_300px]")}>
        <div className="flex min-w-0 flex-col gap-6">
          <CallRecordingPlayer recording={detail.recording} />
          <div id="call-transcript">
            <CallTranscript transcript={detail.transcript} />
          </div>
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

        {!isBranchAdmin && (
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <QuickActionsPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
