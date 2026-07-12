import { createClerkClient } from "@clerk/backend";

const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/** Matches @clerk/nextjs/server's async clerkClient() signature so call sites are unchanged. */
export async function clerkClient() {
  return client;
}
