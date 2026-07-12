import { verifyToken } from "@clerk/backend";

export type VerifiedAuth = { userId: string | null; orgId: string | null };

export function extractBearerToken(headerValue: string | null | undefined): string | null {
  if (!headerValue?.startsWith("Bearer ")) return null;
  return headerValue.slice("Bearer ".length).trim() || null;
}

/** Cryptographically verifies the Clerk session token forwarded from the frontend. */
export async function verifyClerkToken(token: string | null): Promise<VerifiedAuth> {
  if (!token) return { userId: null, orgId: null };

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return { userId: null, orgId: null };

  try {
    const payload = await verifyToken(token, { secretKey });
    return {
      userId: payload.sub,
      orgId: typeof payload.org_id === "string" ? payload.org_id : null,
    };
  } catch {
    return { userId: null, orgId: null };
  }
}
