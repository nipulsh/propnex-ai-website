const CONTACT_PHONE_REGEX = /^\d{10}$/;

export function normalizeContactPhone(raw: string): string | null {
  const digits = raw.trim().replace(/\D/g, "");
  return CONTACT_PHONE_REGEX.test(digits) ? digits : null;
}

export function isValidContactPhone(value: string): boolean {
  return normalizeContactPhone(value) !== null;
}
