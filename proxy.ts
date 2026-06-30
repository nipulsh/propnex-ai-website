import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { hasPendingContractCookie } from "@/lib/pending-contract-cookie";
import { isOnboardingComplete } from "@/lib/onboarding.server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding",
  "/onboarding/complete",
  "/api/contract-id/validate",
  "/api/signup/check-email",
  "/api/webhooks(.*)",
  "/api/internal(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  if (userId && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (userId) {
    const onboardingComplete = await isOnboardingComplete(userId, sessionClaims);

    if (
      onboardingComplete &&
      (pathname === "/onboarding" || pathname === "/onboarding/complete")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!onboardingComplete) {
      const isOnboardingRoute =
        pathname === "/onboarding" || pathname === "/onboarding/complete";

      if (!isOnboardingRoute && !isPublicRoute(req)) {
        const hasPendingContract = await hasPendingContractCookie();
        const redirectPath = hasPendingContract
          ? "/onboarding/complete"
          : "/onboarding";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
