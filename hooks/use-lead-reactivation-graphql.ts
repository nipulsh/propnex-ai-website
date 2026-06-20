"use client";

import { useCallback, useEffect } from "react";

import { fetchLeadsReactivation } from "@/lib/graphql/api";
import type { DormantLead } from "@/lib/lead-reactivation-data";
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

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const minDays =
        inactivityFilter === "30-plus"
          ? 30
          : inactivityFilter === "60-plus"
            ? 60
            : inactivityFilter === "90-plus"
              ? 90
              : 30;

      const data = await fetchLeadsReactivation({
        dormantOnly: true,
        minDaysInactive: minDays,
      });

      const mapped = data.leads.connection.edges.map(({ node }) =>
        mapLeadToDormant(node),
      );
      setLeads(mapped);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dormant leads",
      );
    } finally {
      setLoading(false);
    }
  }, [inactivityFilter, setError, setLeads, setLoading]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { reload };
}
