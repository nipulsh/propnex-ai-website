import { create } from "zustand";

import type {
  CallVolumeRange,
  PrimaryUseCase,
} from "@/lib/user-metadata";

export type OnboardingState = {
  step: number;
  companyName: string;
  phone: string;
  primaryUseCase: PrimaryUseCase | null;
  callVolume: CallVolumeRange | null;
  isSubmitting: boolean;
};

export type OnboardingActions = {
  setStep: (step: number) => void;
  setCompanyName: (name: string) => void;
  setPhone: (phone: string) => void;
  setPrimaryUseCase: (useCase: PrimaryUseCase) => void;
  setCallVolume: (volume: CallVolumeRange) => void;
  setIsSubmitting: (value: boolean) => void;
  reset: () => void;
};

const initialState: OnboardingState = {
  step: 1,
  companyName: "",
  phone: "",
  primaryUseCase: null,
  callVolume: null,
  isSubmitting: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>(
  (set) => ({
    ...initialState,
    setStep: (step) => set({ step }),
    setCompanyName: (companyName) => set({ companyName }),
    setPhone: (phone) => set({ phone }),
    setPrimaryUseCase: (primaryUseCase) => set({ primaryUseCase }),
    setCallVolume: (callVolume) => set({ callVolume }),
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    reset: () => set(initialState),
  }),
);
