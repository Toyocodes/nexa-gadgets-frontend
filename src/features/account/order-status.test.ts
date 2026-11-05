import { describe, expect, it } from "vitest";
import type { Order } from "@/types/api";
import { isUnpaid, statusPill, trackerIndex, trackerSteps } from "./order-status";

const base: Order = {
  _id: "o1",
  userId: "u1",
  cartItems: [],
  orderStatus: "confirmed",
  paymentStatus: "paid",
  totalAmount: 18483,
  orderDate: "2026-11-02T10:00:00Z",
};
const delivery = {
  ...base,
  deliveryMethod: {
    optionId: "d1",
    name: "Lagos Mainland delivery",
    type: "delivery" as const,
    fee: 5000,
  },
};
const pickup = {
  ...base,
  deliveryMethod: { optionId: "d0", name: "Pickup", type: "pickup" as const, fee: 0 },
};

describe("order trackers", () => {
  it("uses the delivery steps for delivery orders and legacy orders without a method", () => {
    expect(trackerSteps(delivery)).toEqual(["Placed", "Confirmed", "In shipping", "Delivered"]);
    expect(trackerSteps(base)).toEqual(["Placed", "Confirmed", "In shipping", "Delivered"]);
  });

  it("uses the pickup steps for pickup orders", () => {
    expect(trackerSteps(pickup)).toEqual(["Placed", "Confirmed", "Ready for pickup", "Collected"]);
  });

  it("maps statuses to steps, including the legacy inProcess status", () => {
    expect(trackerIndex({ ...delivery, orderStatus: "pending" })).toBe(0);
    expect(trackerIndex({ ...delivery, orderStatus: "inProcess" })).toBe(1);
    expect(trackerIndex({ ...delivery, orderStatus: "inShipping" })).toBe(2);
    expect(trackerIndex({ ...pickup, orderStatus: "readyForPickup" })).toBe(2);
    expect(trackerIndex({ ...pickup, orderStatus: "delivered" })).toBe(3);
  });
});

describe("status pill", () => {
  it("flags unpaid orders as awaiting payment", () => {
    const unpaid = {
      ...delivery,
      paymentStatus: "pending" as const,
      orderStatus: "pending" as const,
    };
    expect(isUnpaid(unpaid)).toBe(true);
    expect(statusPill(unpaid)).toEqual({ label: "Awaiting payment", tone: "warning" });
  });

  it("says Collected for finished pickup orders and Delivered otherwise", () => {
    expect(statusPill({ ...pickup, orderStatus: "delivered" }).label).toBe("Collected");
    expect(statusPill({ ...delivery, orderStatus: "delivered" }).label).toBe("Delivered");
  });

  it("shows rejected orders as Cancelled, even if unpaid", () => {
    expect(statusPill({ ...delivery, orderStatus: "rejected", paymentStatus: "pending" })).toEqual({
      label: "Cancelled",
      tone: "danger",
    });
  });
});
