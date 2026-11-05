import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-md border border-input bg-card px-3.5 text-base text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15",
        "aria-invalid:border-[1.5px] aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/15",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
