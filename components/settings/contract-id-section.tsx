"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useContractStatus } from "@/components/common/contract-status-provider";
import { useSideNotification } from "@/components/common/side-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ContractStatus =
  | { linked: false }
  | { linked: true; contractId: string; claimedAt: string | null };

export function ContractIdSection() {
  const router = useRouter();
  const { notify } = useSideNotification();
  const { refetch: refetchGlobalStatus } = useContractStatus();
  const [status, setStatus] = useState<ContractStatus | null>(null);
  const [contractId, setContractId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/company/contract");
      const data = (await response.json()) as ContractStatus & { error?: string };

      if (!response.ok) {
        notify({
          type: "error",
          message: data.error ?? "Failed to load Contract ID status.",
        });
        return;
      }

      setStatus(data.linked ? data : { linked: false });
    } catch {
      notify({ type: "error", message: "Failed to load Contract ID status." });
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  async function handleLink() {
    const value = contractId.trim();
    if (!value) {
      notify({ type: "error", message: "Please enter a Contract ID." });
      return;
    }

    setIsLinking(true);
    try {
      const response = await fetch("/api/company/contract/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: value }),
      });

      const data = (await response.json()) as {
        error?: string;
        linked?: boolean;
        contractId?: string;
        claimedAt?: string;
      };

      if (!response.ok) {
        notify({
          type: "error",
          message: data.error ?? "Failed to link Contract ID.",
        });
        return;
      }

      if (data.linked && data.contractId) {
        setStatus({
          linked: true,
          contractId: data.contractId,
          claimedAt: data.claimedAt ?? null,
        });
        setContractId("");
        notify({
          type: "success",
          message: "Contract ID linked successfully.",
        });
        void refetchGlobalStatus();
        router.refresh();
      }
    } catch {
      notify({ type: "error", message: "Failed to link Contract ID." });
    } finally {
      setIsLinking(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 border-t border-propnex-border pt-4">
        <div className="flex items-center gap-2 text-sm text-propnex-muted">
          <Loader2 className="size-4 animate-spin" />
          Loading Contract ID…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-propnex-border pt-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Contract ID</h3>
        <p className="mt-1 text-xs text-propnex-muted">
          Link the Contract ID provided by PropNex to connect your account to
          your company workspace.
        </p>
      </div>

      {status?.linked ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-propnex-muted">Linked Contract ID</label>
            <Input
              readOnly
              value={status.contractId}
              className="font-mono uppercase"
            />
          </div>
          <p className="text-xs text-propnex-muted">
            This Contract ID has been linked to your account and cannot be
            changed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="contract-id" className="text-xs text-propnex-muted">
              Contract ID
            </label>
            <Input
              id="contract-id"
              value={contractId}
              onChange={(e) => setContractId(e.target.value.toUpperCase())}
              disabled={isLinking}
              placeholder="XXXXXXXXXX"
              maxLength={10}
              className="font-mono uppercase"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button onClick={() => void handleLink()} disabled={isLinking}>
            {isLinking ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Validating…
              </>
            ) : (
              "Validate & Link"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
