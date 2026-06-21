function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Always-on structured logs for Vercel/runtime debugging. */
export function gqlLog(step: string, data?: Record<string, unknown>): void {
  console.log(`[graphql] ${step}`, data ?? {});
}

export async function gqlLogTimed<T>(
  step: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  gqlLog(`${step}:start`);
  try {
    const result = await fn();
    gqlLog(`${step}:done`, { ms: Math.round(performance.now() - start) });
    return result;
  } catch (error) {
    gqlLog(`${step}:error`, {
      ms: Math.round(performance.now() - start),
      error: formatError(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export function gqlDebug(label: string, data?: Record<string, unknown>): void {
  if (process.env.GRAPHQL_DEBUG !== "1") return;
  console.info(`[gql] ${label}`, { ...data, ts: Date.now() });
}

export async function gqlDebugTimed<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (process.env.GRAPHQL_DEBUG !== "1") {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    console.info(`[gql] ${label}:done`, {
      ms: Math.round(performance.now() - start),
      ts: Date.now(),
    });
    return result;
  } catch (error) {
    console.info(`[gql] ${label}:error`, {
      ms: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : String(error),
      ts: Date.now(),
    });
    throw error;
  }
}
