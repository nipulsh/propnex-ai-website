"use client";

import { cn } from "@/lib/utils";
import type { VoiceGender } from "@/stores/agent-architect-store";

const options: { value: VoiceGender; label: string }[] = [
  { value: "M", label: "M" },
  { value: "F", label: "F" },
  { value: "N", label: "N" },
];

type VoiceGenderToggleProps = {
  value: VoiceGender;
  onChange: (value: VoiceGender) => void;
};

export function VoiceGenderToggle({ value, onChange }: VoiceGenderToggleProps) {
  return (
    <div className="flex rounded-lg border border-propnex-border bg-propnex-bg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-propnex-accent text-propnex-bg"
              : "text-propnex-muted hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
