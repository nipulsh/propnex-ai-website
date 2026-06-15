import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  label,
}: QuantityStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  const handleInput = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      onChange(min);
      return;
    }
    onChange(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <div className="flex items-center gap-3">
      {label ? (
        <span className="text-sm text-propnex-muted">{label}</span>
      ) : null}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={decrement}
          disabled={value <= min}
          aria-label="Decrease quantity"
        >
          <Minus className="size-3.5" />
        </Button>
        <Input
          type="number"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          className="h-8 w-16 text-center"
          min={min}
          max={max}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={increment}
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
