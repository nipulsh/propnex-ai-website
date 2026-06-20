type ClerkApiErrorShape = {
  errors?: { code?: string }[];
  status?: number;
};

export function isClerkOrganizationsDisabled(error: unknown): boolean {
  const err = error as ClerkApiErrorShape;
  return (
    err.errors?.some(
      (e) => e.code === "organization_not_enabled_in_instance",
    ) ?? false
  );
}

export function isClerkNotFound(error: unknown): boolean {
  const err = error as ClerkApiErrorShape;
  return err.status === 404;
}
