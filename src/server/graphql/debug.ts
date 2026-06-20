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
