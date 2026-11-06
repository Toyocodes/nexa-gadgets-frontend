import { describe, expect, it } from "vitest";
import { signedOut } from "@/features/auth/auth-slice";
import type { Product } from "@/types/api";
import guestCartSlice, {
  guestItemAdded,
  guestItemRemoved,
  guestMergeFailed,
  guestMergeStarted,
  guestMergeSucceeded,
  guestQuantitySet,
  parseGuestCart,
} from "./guest-cart-slice";
import { toGuestCartLines } from "./use-cart";
import { adjustmentMessage } from "./use-merge-guest-cart";

const reducer = guestCartSlice.reducer;
const empty = { items: [], merge: "idle" as const };
const line = { productId: "a", quantity: 1 };

describe("guest cart state", () => {
  it("adds up repeat adds and removes lines", () => {
    let state = reducer(empty, guestItemAdded(line));
    state = reducer(state, guestItemAdded({ productId: "a", quantity: 2 }));
    expect(state.items).toEqual([{ productId: "a", quantity: 3 }]);
    state = reducer(state, guestQuantitySet({ productId: "a", quantity: 1 }));
    expect(state.items[0]?.quantity).toBe(1);
    expect(reducer(state, guestItemRemoved("a")).items).toEqual([]);
  });

  it("keeps items until the merge succeeds, so a failure loses nothing", () => {
    let state = reducer({ items: [line], merge: "idle" }, guestMergeStarted());
    expect(state.items).toEqual([line]);
    state = reducer(state, guestMergeFailed());
    expect(state).toEqual({ items: [line], merge: "failed" });
    expect(reducer({ items: [line], merge: "merging" }, guestMergeSucceeded())).toEqual(empty);
  });

  it("allows another merge attempt after signing out", () => {
    expect(reducer({ items: [line], merge: "failed" }, signedOut()).merge).toBe("idle");
  });
});

describe("parseGuestCart", () => {
  it("drops anything that isn't a valid line", () => {
    const raw = JSON.stringify([
      line,
      { productId: "b", quantity: 0 },
      { productId: "c", quantity: 1.5 },
      { quantity: 1 },
      null,
    ]);
    expect(parseGuestCart(raw)).toEqual([line]);
  });
  it("survives missing or corrupt storage", () => {
    expect(parseGuestCart(null)).toEqual([]);
    expect(parseGuestCart("{not json")).toEqual([]);
    expect(parseGuestCart('{"a":1}')).toEqual([]);
  });
});

describe("toGuestCartLines", () => {
  const product = {
    _id: "a",
    image: "a.png",
    title: "Phone",
    price: 100,
    salePrice: 80,
  } as Product;

  it("uses live prices, keeps the guest's order and skips deleted products", () => {
    const lines = toGuestCartLines(
      [
        { productId: "gone", quantity: 1 },
        { productId: "a", quantity: 2 },
      ],
      [product],
    );
    expect(lines).toEqual([
      { productId: "a", quantity: 2, image: "a.png", title: "Phone", price: 100, salePrice: 80 },
    ]);
  });
});

describe("adjustmentMessage", () => {
  it("says what changed", () => {
    expect(adjustmentMessage([{ productId: "a", title: "Galaxy", quantity: 2 }])).toBe(
      "Only 2 of Galaxy are available",
    );
    expect(adjustmentMessage([{ productId: "a", title: "Galaxy", quantity: 0 }])).toBe(
      "Galaxy is no longer available",
    );
    expect(adjustmentMessage([{ productId: "a", title: null, quantity: 0 }])).toBe(
      "An item in your cart is no longer available",
    );
    expect(
      adjustmentMessage([
        { productId: "a", title: "Galaxy", quantity: 1 },
        { productId: "b", title: null, quantity: 0 },
      ]),
    ).toBe("2 items changed because of limited stock");
  });
});
