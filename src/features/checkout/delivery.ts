import { formatNaira } from "@/lib/format";
import type { DeliveryOption } from "@/types/api";

/** "Lagos Mainland delivery" → "Lagos Mainland" for compact copy. */
export const zoneName = (name: string) => name.replace(/\s+delivery$/i, "");

/**
 * "Lagos Mainland ₦5,000 · Lagos Island ₦8,000 · or pick up in store after paying",
 * built from the live options so fee changes in admin show up everywhere.
 */
export function deliverySummary(options: DeliveryOption[] | undefined) {
  if (!options?.length) return "Lagos delivery or store pickup";
  const zones = options
    .filter((o) => o.type === "delivery")
    .map((o) => `${zoneName(o.name)} ${formatNaira(o.fee)}`);
  const pickup = options.some((o) => o.type === "pickup");
  return [...zones, pickup ? "or pick up in store after paying" : null].filter(Boolean).join(" · ");
}
