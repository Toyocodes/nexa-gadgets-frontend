import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";
import { statusPill, TONE_CLASSES, trackerIndex, trackerSteps } from "../order-status";

export function StatusPill({ order }: { order: Order }) {
  const { label, tone } = statusPill(order);
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap",
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  );
}

/** Placed → Confirmed → In shipping/Ready for pickup → Delivered/Collected. */
export function OrderTracker({ order }: { order: Order }) {
  const steps = trackerSteps(order);
  const current = trackerIndex(order);
  return (
    <ol aria-label="Order progress" className="m-0 grid list-none grid-cols-4 gap-2 p-0">
      {steps.map((label, i) => (
        <li
          key={label}
          aria-current={i === current ? "step" : undefined}
          className="flex flex-col gap-2.5"
        >
          <span className={cn("h-1 rounded-full", i <= current ? "bg-primary" : "bg-border")} />
          <span
            className={cn(
              "text-xs md:text-[13px]",
              i < current && "font-semibold",
              i === current && "font-semibold text-primary",
              i > current && "text-muted-foreground",
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function OrderThumbs({ order }: { order: Order }) {
  const items = order.cartItems;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex flex-none gap-2">
        {items.slice(0, 3).map((item) => (
          <ProductImage
            key={item.productId}
            src={item.image}
            alt=""
            iconSize={28}
            iconStroke={1.2}
            className="size-14 rounded-md"
          />
        ))}
      </div>
      <span className="line-clamp-2 text-sm text-ink-2">
        {items.map((i) => i.title).join(", ")}
        {items.length > 3 && ` +${items.length - 3} more`}
      </span>
    </div>
  );
}
