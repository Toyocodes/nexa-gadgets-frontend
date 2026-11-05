import { Minus, Plus } from "lucide-react";

interface StepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  canIncrease?: boolean;
  canDecrease?: boolean;
  size?: "md" | "lg";
}

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  canIncrease = true,
  canDecrease = true,
  size = "md",
}: StepperProps) {
  const lg = size === "lg";
  const btn = `flex items-center justify-center text-foreground disabled:opacity-30 ${lg ? "h-[50px] w-12" : "h-[42px] w-11"}`;
  return (
    <div
      className={`flex items-center border border-input bg-card ${lg ? "h-13 rounded-lg" : "h-11 rounded-md"}`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={btn}
        onClick={onDecrease}
        disabled={!canDecrease}
      >
        <Minus size={lg ? 16 : 14} strokeWidth={2} />
      </button>
      <span
        aria-live="polite"
        className={`text-center font-mono font-semibold ${lg ? "w-8 text-base" : "w-6 text-sm"}`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={btn}
        onClick={onIncrease}
        disabled={!canIncrease}
      >
        <Plus size={lg ? 16 : 14} strokeWidth={2} />
      </button>
    </div>
  );
}
