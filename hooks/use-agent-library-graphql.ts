"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchAgentLibraryBySlug,
  fetchAgentLibraryList,
} from "@/lib/graphql/api";
import {
  mapGraphQLLibraryEntryToTemplate,
  type AgentLibraryTemplate,
} from "@/lib/agent-library-data";

export function useAgentLibraryGraphQL() {
  const [templates, setTemplates] = useState<AgentLibraryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentLibraryList();
      const mapped = data.agentLibrary.list.map(mapGraphQLLibraryEntryToTemplate);
      setTemplates(mapped);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load agent library",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { templates, loading, error, reload };
}

export function useAgentLibraryTemplate(slug: string) {
  const [template, setTemplate] = useState<AgentLibraryTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchAgentLibraryBySlug(slug);
        const entry = data.agentLibrary.bySlug;
        if (!cancelled) {
          setTemplate(
            entry ? mapGraphQLLibraryEntryToTemplate(entry) : null,
          );
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load template",
          );
          setTemplate(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { template, loading, error };
}
