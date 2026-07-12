type SetupBannerProps = {
  type: "success" | "error";
  message: string;
};

export function SetupBanner({ type, message }: SetupBannerProps) {
  const isSuccess = type === "success";

  return (
    <p
      className={
        isSuccess
          ? "rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          : "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      }
      role="status"
    >
      {message}
    </p>
  );
}
