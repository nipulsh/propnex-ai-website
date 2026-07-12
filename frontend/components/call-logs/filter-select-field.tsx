import { ChevronDown, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FilterSelectFieldProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
};

export function FilterSelectField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  options,
  className,
}: FilterSelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-10 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
      </div>
    </div>
  );
}
