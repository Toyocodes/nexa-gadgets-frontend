import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Light text and a softer accent dot, for dark panels. */
  inverted?: boolean;
  to?: string | null;
}

/** The "nexa." wordmark. */
export function Logo({ className, inverted, to = "/" }: LogoProps) {
  const mark = (
    <span
      className={cn(
        "text-[26px] leading-none font-bold tracking-[-0.05em]",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
    >
      nexa<span className={inverted ? "text-night-accent" : "text-primary"}>.</span>
    </span>
  );
  if (!to) return mark;
  return (
    <Link to={to} aria-label="Nexa Gadgets home" className="inline-flex no-underline">
      {mark}
    </Link>
  );
}
