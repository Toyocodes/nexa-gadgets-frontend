import type { Order } from "@/types/api";

export type Tone = "info" | "success" | "warning" | "danger";

/** Orders created before the redesign have no deliveryMethod — treat them as delivery. */
export const isPickup = (o: Order) => o.deliveryMethod?.type === "pickup";
export const isUnpaid = (o: Order) => o.paymentStatus !== "paid" && o.orderStatus !== "rejected";
export const isFinished = (o: Order) => o.orderStatus === "delivered";

export function trackerSteps(o: Order) {
  return isPickup(o)
    ? ["Placed", "Confirmed", "Ready for pickup", "Collected"]
    : ["Placed", "Confirmed", "In shipping", "Delivered"];
}

/** Index of the current tracker step (0–3). */
export function trackerIndex(o: Order) {
  switch (o.orderStatus) {
    case "delivered":
      return 3;
    case "inShipping":
    case "readyForPickup":
      return 2;
    case "confirmed":
    case "inProcess": // legacy status — shown as Confirmed
      return 1;
    default:
      return 0;
  }
}

/** The pill next to the order number. */
export function statusPill(o: Order): { label: string; tone: Tone } {
  if (o.orderStatus === "rejected") return { label: "Cancelled", tone: "danger" };
  if (isUnpaid(o)) return { label: "Awaiting payment", tone: "warning" };
  if (o.orderStatus === "delivered")
    return { label: isPickup(o) ? "Collected" : "Delivered", tone: "success" };
  return { label: trackerSteps(o)[trackerIndex(o)]!, tone: "info" };
}

export const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive/10 text-destructive",
};
