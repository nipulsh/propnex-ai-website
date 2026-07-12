"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ContractStatusValue =
  | { linked: false; contractId: null; claimedAt: null }
  | { linked: true; contractId: string; claimedAt: string | null };

type ContractStatusContextValue = {
  /** null while the initial status fetch is in flight. */
  status: ContractStatusValue | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const ContractStatusContext = createContext<ContractStatusContextValue | null>(
  null,
);

export function ContractStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ContractStatusValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/company/contract");
      if (!response.ok) {
        setStatus({ linked: false, contractId: null, claimedAt: null });
        return;
      }

      const data = (await response.json()) as {
        linked?: boolean;
        contractId?: string;
        claimedAt?: string | null;
      };

      setStatus(
        data.linked && data.contractId
          ? {
              linked: true,
              contractId: data.contractId,
              claimedAt: data.claimedAt ?? null,
            }
          : { linked: false, contractId: null, claimedAt: null },
      );
    } catch {
      setStatus({ linked: false, contractId: null, claimedAt: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  return (
    <ContractStatusContext.Provider
      value={{ status, isLoading, refetch: fetchStatus }}
    >
      {children}
    </ContractStatusContext.Provider>
  );
}

export function useContractStatus() {
  const context = useContext(ContractStatusContext);

  if (!context) {
    throw new Error(
      "useContractStatus must be used within a ContractStatusProvider",
    );
  }

  return context;
}
