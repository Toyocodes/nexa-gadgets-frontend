import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

/** A radio rendered as a full-width card; selected = 2px blue border on a blue tint. */
export function ChoiceCard({
  value,
  selected,
  children,
  className,
}: {
  value: string;
  selected: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = `choice-${value}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg bg-card px-4 py-3.5 md:gap-3.5 md:px-[18px] md:py-4",
        selected
          ? "border-2 border-primary bg-primary-tint"
          : "border border-input hover:border-border-strong",
        // Keep content from shifting when the border thickens.
        !selected && "m-px",
        className,
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</span>
    </label>
  );
}
