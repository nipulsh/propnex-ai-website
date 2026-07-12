type BillingBannerProps = {
  type: "success" | "error" | "info";
  message: string;
};

export function BillingBanner({ type, message }: BillingBannerProps) {
  const styles = {
    success: "border-success/30 bg-success/10 text-success",
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    info: "border-propnex-accent/30 bg-propnex-accent/10 text-propnex-accent",
  };

  return (
    <p
      className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}
      role="status"
    >
      {message}
    </p>
  );
}
