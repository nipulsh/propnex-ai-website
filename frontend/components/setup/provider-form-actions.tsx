"use client";

import { PlugZap, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetupStore } from "@/stores/setup-store";

type ProviderFormActionsProps = {
  canSave: boolean;
};

export function ProviderFormActions({ canSave }: ProviderFormActionsProps) {
  const isSaving = useSetupStore((state) => state.isSaving);
  const isTesting = useSetupStore((state) => state.isTesting);
  const testConnection = useSetupStore((state) => state.testConnection);
  const saveConfiguration = useSetupStore((state) => state.saveConfiguration);

  return (
    <div className="flex flex-wrap gap-3 border-t border-propnex-border pt-5">
      <Button
        type="button"
        variant="outline"
        onClick={() => void testConnection()}
        disabled={isTesting}
        className="h-11 gap-2 border-propnex-border bg-propnex-bg px-4"
      >
        <PlugZap className="size-4" />
        {isTesting ? "Testing…" : "Test Connection"}
      </Button>
      <Button
        type="button"
        onClick={() => void saveConfiguration()}
        disabled={isSaving || !canSave}
        className="h-11 gap-2 px-4"
      >
        <Save className="size-4" />
        {isSaving ? "Saving…" : "Save Configuration"}
      </Button>
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

export function SetupFormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted"
      />
    </div>
  );
}
