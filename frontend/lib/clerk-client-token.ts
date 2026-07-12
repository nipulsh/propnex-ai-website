/** Browser-only: reads the current Clerk session token via the global Clerk instance. */
export async function getClerkClientToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const clerk = (window as unknown as {
    Clerk?: { session?: { getToken(): Promise<string | null> } };
  }).Clerk;

  return (await clerk?.session?.getToken()) ?? null;
}
