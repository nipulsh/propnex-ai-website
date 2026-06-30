import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "propnex_pending_contract";
const COOKIE_MAX_AGE_SECONDS = 60 * 60;

type PendingContractPayload = {
  contractId: string;
  exp: number;
};

function getCookieSecret(): string {
  const secret =
    process.env.CONTRACT_COOKIE_SECRET ?? process.env.CLERK_SECRET_KEY;
  if (!secret) {
    throw new Error("CONTRACT_COOKIE_SECRET or CLERK_SECRET_KEY must be set");
  }
  return secret;
}

function signPayload(payload: string): string {
  const signature = createHmac("sha256", getCookieSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifySignedValue(value: string): string | null {
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) {
    return null;
  }

  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);
  const expected = createHmac("sha256", getCookieSecret())
    .update(payload)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return payload;
}

function encodePayload(payload: PendingContractPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): PendingContractPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as PendingContractPayload;

    if (
      typeof parsed.contractId !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setPendingContractCookie(contractId: string) {
  const payload = encodePayload({
    contractId,
    exp: Date.now() + COOKIE_MAX_AGE_SECONDS * 1000,
  });
  const signed = signPayload(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function getPendingContractCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) {
    return null;
  }

  const payloadEncoded = verifySignedValue(value);
  if (!payloadEncoded) {
    return null;
  }

  const payload = decodePayload(payloadEncoded);
  if (!payload || payload.exp < Date.now()) {
    return null;
  }

  return payload.contractId;
}

export async function clearPendingContractCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function hasPendingContractCookie(): Promise<boolean> {
  const contractId = await getPendingContractCookie();
  return contractId != null;
}
