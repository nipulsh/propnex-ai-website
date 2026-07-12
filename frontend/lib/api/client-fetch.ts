import { getClerkClientToken } from "@/lib/clerk-client-token";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Browser-only fetch to the backend, attaching the current Clerk session as a bearer token. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getClerkClientToken();
  const headers = new Headers(init.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
