"use client";

import { useCallback } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { LeadsReactivationResult } from "@/lib/graphql/queries";
import type { DormantLead } from "@/lib/lead-reactivation-data";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useLeadReactivationStore } from "@/stores/lead-reactivation-store";

type GraphQLLeadNode = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  lastContactedAt: string | null;
  sourceName: string | null;
  temperature: string | null;
  score: number;
};

function mapLeadToDormant(node: GraphQLLeadNode): DormantLead {
  const lastContactMs = node.lastContactedAt
    ? new Date(node.lastContactedAt).getTime()
    : Date.now();
  const daysInactive = node.lastContactedAt
    ? Math.floor((Date.now() - lastContactMs) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    id: node.id,
    contactName:
      [node.firstName, node.lastName].filter(Boolean).join(" ") || "Unknown",
    phoneNumber: node.phone ?? "",
    lastContactAt: lastContactMs,
    daysInactive,
    agentId: "",
    agentName: "Unassigned",
    source: node.sourceName ?? "Manual",
    status: "dormant",
  };
}

export function useLeadReactivationGraphQL() {
  const setLeads = useLeadReactivationStore((s) => s.setLeads);
  const setLoading = useLeadReactivationStore((s) => s.setLoading);
  const setError = useLeadReactivationStore((s) => s.setError);
  const inactivityFilter = useLeadReactivationStore((s) => s.inactivity);

  const minDaysInactive =
    inactivityFilter === "30-plus"
      ? 30
      : inactivityFilter === "60-plus"
        ? 60
        : inactivityFilter === "90-plus"
          ? 90
          : 30;

  const applyPageData = useCallback(
    (data: LeadsReactivationResult) => {
      const mapped = data.leads.connection.edges.map(({ node }) =>
        mapLeadToDormant(node),
      );
      setLeads(mapped);
      setError(null);
    },
    [setError, setLeads],
  );

  const fetchPage = useCallback(
    () =>
      fetchCachedPage<LeadsReactivationResult>("lead-reactivation", {
        filter: { dormantOnly: true, minDaysInactive },
      }),
    [minDaysInactive],
  );

  const { reload } = useCachedPagePoll({
    loadKey: "lead-reactivation",
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setLoading,
    deps: [inactivityFilter],
  });

  return { reload };
}
