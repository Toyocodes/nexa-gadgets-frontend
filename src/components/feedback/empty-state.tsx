import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
        </span>
      )}
      <div className="max-w-md">
        <h2 className="text-lg font-semibold">{title}</h2>
        {body && <p className="mt-1 text-[15px] leading-normal text-muted-foreground">{body}</p>}
      </div>
      {action}
    </div>
  );
}
