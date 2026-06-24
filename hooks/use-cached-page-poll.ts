"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 10_000;

type ReloadOptions = {
  silent?: boolean;
  showLoading?: boolean;
};

type UseCachedPagePollOptions<T> = {
  enabled?: boolean;
  intervalMs?: number;
  deps?: unknown[];
  fetchPage: () => Promise<T>;
  onData: (data: T) => void;
  onError?: (message: string) => void;
  onLoading?: (loading: boolean) => void;
  skipHidden?: boolean;
};

export function useCachedPagePoll<T>({
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  deps = [],
  fetchPage,
  onData,
  onError,
  onLoading,
  skipHidden = true,
}: UseCachedPagePollOptions<T>) {
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onLoadingRef = useRef(onLoading);
  onLoadingRef.current = onLoading;

  const hasLoadedOnceRef = useRef(false);

  const reload = useCallback(
    async (options?: ReloadOptions) => {
      if (skipHidden && document.visibilityState === "hidden") {
        return;
      }

      const silent = options?.silent ?? false;
      const showLoading =
        options?.showLoading ??
        (!silent && !hasLoadedOnceRef.current);

      if (showLoading) {
        onLoadingRef.current?.(true);
      }
      try {
        const data = await fetchPageRef.current();
        onDataRef.current(data);
      } catch (error) {
        onErrorRef.current?.(
          error instanceof Error ? error.message : "Failed to load page data",
        );
      } finally {
        if (showLoading) {
          onLoadingRef.current?.(false);
        }
        hasLoadedOnceRef.current = true;
      }
    },
    [skipHidden],
  );

  useEffect(() => {
    if (!enabled) return;

    void reload();
    const intervalId = window.setInterval(() => {
      void reload({ silent: true });
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
      hasLoadedOnceRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps array controls refetch identity
  }, [enabled, intervalMs, reload, ...deps]);

  return { reload };
}
