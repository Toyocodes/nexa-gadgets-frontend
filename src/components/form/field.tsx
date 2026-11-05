import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps {
  id: string;
  label: React.ReactNode;
  /** Muted helper under the input ("Shown next to your product reviews"). */
  hint?: React.ReactNode;
  /** Error under the field it belongs to — never only in a toast. */
  error?: string;
  /** Right side of the label row (e.g. "Forgot password?"). */
  aside?: React.ReactNode;
  optional?: boolean;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

export function Field({
  id,
  label,
  hint,
  error,
  aside,
  optional,
  className,
  labelClassName,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className={cn("text-sm font-medium", labelClassName)}>
          {label}
          {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-[13px] font-medium text-destructive"
        >
          <CircleAlert size={14} strokeWidth={2} aria-hidden="true" className="flex-none" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Input with a fixed prefix box, e.g. "+234" or "₦". */
export function PrefixInput({
  prefix,
  className,
  invalid,
  ...props
}: { prefix: string; invalid?: boolean } & React.ComponentProps<"input">) {
  return (
    <span
      className={cn(
        "flex h-12 items-center overflow-hidden rounded-md border border-input bg-card focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15",
        invalid && "border-[1.5px] border-destructive",
        className,
      )}
    >
      <span className="flex h-full items-center border-r border-input bg-muted px-3 font-mono text-[15px] font-medium">
        {prefix}
      </span>
      <input
        {...props}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
    </span>
  );
}
