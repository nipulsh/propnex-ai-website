import { create } from "zustand";

export type ContractValidationState =
  | "idle"
  | "validating"
  | "valid"
  | "invalid"
  | "claimed"
  | "error";

export type OnboardingState = {
  step: number;
  contractId: string;
  companyName: string | null;
  validationState: ContractValidationState;
  validationError: string | null;
  isSubmitting: boolean;
};

export type OnboardingActions = {
  setStep: (step: number) => void;
  setContractId: (contractId: string) => void;
  setCompanyName: (companyName: string | null) => void;
  setValidationState: (state: ContractValidationState) => void;
  setValidationError: (error: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  reset: () => void;
};

const initialState: OnboardingState = {
  step: 1,
  contractId: "",
  companyName: null,
  validationState: "idle",
  validationError: null,
  isSubmitting: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>(
  (set) => ({
    ...initialState,
    setStep: (step) => set({ step }),
    setContractId: (contractId) =>
      set({ contractId, validationState: "idle", validationError: null }),
    setCompanyName: (companyName) => set({ companyName }),
    setValidationState: (validationState) => set({ validationState }),
    setValidationError: (validationError) => set({ validationError }),
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    reset: () => set(initialState),
  }),
);
