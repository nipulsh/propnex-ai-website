"use client";

import { useCallback, useState } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { AgentLibraryBySlugResult, AgentLibraryListResult } from "@/lib/graphql/queries";
import {
  mapGraphQLLibraryEntryToTemplate,
  type AgentLibraryTemplate,
} from "@/lib/agent-library-data";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";

export function useAgentLibraryGraphQL() {
  const [templates, setTemplates] = useState<AgentLibraryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyPageData = useCallback((data: AgentLibraryListResult) => {
    const mapped = data.agentLibrary.list.map(mapGraphQLLibraryEntryToTemplate);
    setTemplates(mapped);
    setError(null);
  }, []);

  const fetchPage = useCallback(
    () => fetchCachedPage<AgentLibraryListResult>("agent-library"),
    [],
  );

  const { reload } = useCachedPagePoll({
    loadKey: "agent-library",
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setIsLoading,
  });

  return { templates, isLoading, error, reload };
}

export function useAgentLibraryTemplate(slug: string) {
  const [template, setTemplate] = useState<AgentLibraryTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyPageData = useCallback((data: AgentLibraryBySlugResult) => {
    const entry = data.agentLibrary.bySlug;
    setTemplate(entry ? mapGraphQLLibraryEntryToTemplate(entry) : null);
    setError(null);
  }, []);

  const fetchPage = useCallback(
    () => fetchCachedPage<AgentLibraryBySlugResult>("agent-template", { slug }),
    [slug],
  );

  useCachedPagePoll({
    enabled: Boolean(slug),
    loadKey: `agent-template:${slug}`,
    fetchPage,
    onData: applyPageData,
    onError: (message) => {
      setError(message);
      setTemplate(null);
    },
    onLoading: setLoading,
    deps: [slug],
  });

  return { template, loading, error };
}
