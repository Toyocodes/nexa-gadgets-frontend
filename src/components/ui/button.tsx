import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Button variants mirror the redesign: one brand-blue primary action per
 * screen, black "ink" buttons for secondary emphasis, and quiet outlines.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        ink: "bg-foreground text-ink-foreground hover:bg-foreground/85",
        outline: "border border-input bg-card text-foreground hover:bg-muted",
        "outline-ink":
          "border border-foreground bg-transparent text-foreground hover:bg-foreground/5",
        dashed:
          "border border-dashed border-border-strong bg-transparent text-foreground hover:bg-card",
        ghost: "text-foreground hover:bg-muted",
        link: "h-auto px-0 text-primary hover:text-primary-hover",
        "link-muted": "h-auto px-1 text-muted-foreground underline hover:text-foreground",
        "link-destructive": "h-auto px-1 text-destructive hover:underline",
      },
      size: {
        sm: "h-9 rounded-full px-3 text-[13px]",
        md: "h-11 rounded-md px-4 text-sm",
        default: "h-12 rounded-lg px-7 text-[15px]",
        lg: "h-13 rounded-lg px-6 text-base",
        xl: "h-14 rounded-lg px-6 text-base",
        icon: "size-11 rounded-full",
        "icon-lg": "size-13 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
