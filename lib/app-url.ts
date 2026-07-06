/** Absolute app origin, e.g. http://localhost:3000 */
export function getAppOrigin(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return base.replace(/\/$/, "");
}

/** Post-invite redirect target — sends users to the app dashboard after accepting. */
export function getInviteAcceptRedirectUrl(): string {
  return `${getAppOrigin()}/dashboard`;
}
