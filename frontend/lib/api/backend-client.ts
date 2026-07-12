import { auth } from "@clerk/nextjs/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Server-side fetch to the backend, forwarding the caller's Clerk session as a bearer token. */
export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  const { getToken } = await auth();
  const token = await getToken();

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
