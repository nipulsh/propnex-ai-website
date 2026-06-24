"use client";

import { useUser } from "@clerk/nextjs";

import { useCreditsGraphQL } from "@/hooks/use-credits-graphql";

export function CreditsSync() {
  const { isSignedIn } = useUser();
  useCreditsGraphQL(Boolean(isSignedIn));
  return null;
}
