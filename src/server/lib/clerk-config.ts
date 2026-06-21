/**
 * Clerk webhooks are optional. Local dev uses direct API provisioning during
 * onboarding (`provisionOrganizationForUser`) instead of webhook sync.
 */
export function isClerkWebhooksEnabled(): boolean {
  return process.env.CLERK_WEBHOOKS_ENABLED === "true";
}
