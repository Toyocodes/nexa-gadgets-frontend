import { useState } from "react";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { passwordChecks } from "../password-rules";

/** Password field with a show/hide toggle inside the box. */
export function PasswordInput({
  className,
  invalid,
  ...props
}: React.ComponentProps<"input"> & { invalid?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={cn(
        "flex h-12 items-center rounded-md border border-input bg-card pl-3.5 focus-within:border-[1.5px] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15",
        invalid && "border-[1.5px] border-destructive focus-within:border-destructive",
        className,
      )}
    >
      <input
        {...props}
        type={visible ? "text" : "password"}
        className="min-w-0 flex-1 border-0 bg-transparent text-base text-foreground outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="flex size-[46px] flex-none items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
      </button>
    </div>
  );
}

/**
 * Client-side guidance only: the server enforces just "8+ characters".
 * Score 0–4: anything typed, 8+ chars, a number, a symbol.
 */
export function PasswordStrength({ password }: { password: string }) {
  const checks = passwordChecks(password);
  const score = password
    ? 1 + Number(checks.length) + Number(checks.number) + Number(checks.symbol)
    : 0;
  const strong = score >= 3;
  const barColor = strong ? "bg-success" : "bg-warning";

  const weakHint = !checks.length
    ? checks.number
      ? "Weak — use 8+ characters"
      : "Weak — use 8+ characters with a number"
    : !checks.number
      ? "Okay — add a number"
      : !checks.symbol
        ? "Good — a symbol makes it strong"
        : "Strong password";

  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden="true" className="mt-1 grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={cn("h-1 rounded-full", n <= score ? barColor : "bg-border")} />
        ))}
      </div>
      {password && (
        <span
          className={cn(
            "text-[13px] font-medium md:hidden",
            strong ? "text-success" : "text-warning",
          )}
          aria-live="polite"
        >
          {weakHint}
        </span>
      )}
      <ul className="m-0 hidden list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[13px] md:flex">
        <Rule ok={checks.length}>8+ characters</Rule>
        <Rule ok={checks.number}>A number</Rule>
        <Rule ok={checks.symbol}>A symbol (makes it strong)</Rule>
      </ul>
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("flex items-center gap-1.5", ok ? "text-success" : "text-muted-foreground")}>
      {ok ? (
        <Check size={14} strokeWidth={2.4} aria-hidden="true" />
      ) : (
        <Circle size={14} strokeWidth={2} aria-hidden="true" />
      )}
      {children}
      <span className="sr-only">{ok ? "(met)" : "(not met)"}</span>
    </li>
  );
}
