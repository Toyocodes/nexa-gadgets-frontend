import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageSpinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[50vh] items-center justify-center text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="size-7 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
