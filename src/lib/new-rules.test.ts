import { describe, expect, it } from "vitest";
import { orderNotes } from "@/features/account/order-status";
import { toProductSearchParams } from "@/features/catalog/catalog-api";
import { listingTitle, type ListingFilters } from "@/features/catalog/use-listing-filters";
import type { Order } from "@/types/api";
import { serverErrorField } from "./api/errors";
import { parseThemeChoice, resolveTheme } from "./theme";

describe("serverErrorField", () => {
  const fields = ["email", "password"] as const;
  it("reads the field from a thrown error or a 200 body", () => {
    expect(serverErrorField({ status: 409, data: { field: "email" } }, fields)).toBe("email");
    expect(serverErrorField({ success: false, field: "password" }, fields)).toBe("password");
  });
  it("ignores fields the form doesn't have, and errors without one", () => {
    expect(serverErrorField({ status: 400, data: { field: "phone" } }, fields)).toBeNull();
    expect(serverErrorField({ status: 429, data: { message: "Too many" } }, fields)).toBeNull();
    expect(serverErrorField({ status: "FETCH_ERROR", error: "x" }, fields)).toBeNull();
    expect(serverErrorField(undefined, fields)).toBeNull();
  });
});

describe("search on the listing", () => {
  it("sends the term and ids to the products endpoint", () => {
    const params = new URLSearchParams(toProductSearchParams({ q: "c++", ids: ["a", "b"] }));
    expect(params.get("q")).toBe("c++");
    expect(params.get("ids")).toBe("a,b");
  });
  it("titles the page after the search term first", () => {
    const filters: ListingFilters = {
      q: "iphone",
      category: ["phones"],
      brand: [],
      inStock: false,
      onSale: true,
      sort: "featured",
    };
    expect(listingTitle(filters)).toBe("Results for “iphone”");
  });
});

describe("orderNotes", () => {
  const order = (o: Partial<Order>) => o as Order;
  it("prefers the order's own notes", () => {
    const saved = { addressInfo: { notes: "Saved" } };
    expect(orderNotes(order({ ...saved, deliveryNotes: "Call first" }))).toBe("Call first");
  });
  it("treats empty as the customer removing them for this order", () => {
    expect(orderNotes(order({ addressInfo: { notes: "Saved" }, deliveryNotes: "" }))).toBe("");
  });
  it("falls back to the address for orders placed before per-order notes", () => {
    expect(orderNotes(order({ addressInfo: { notes: "Saved" } }))).toBe("Saved");
    expect(orderNotes(order({}))).toBe("");
  });
});

describe("theme", () => {
  it("follows the device unless a theme was chosen", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("treats unknown stored values as system", () => {
    expect(parseThemeChoice("dark")).toBe("dark");
    expect(parseThemeChoice("purple")).toBe("system");
    expect(parseThemeChoice(null)).toBe("system");
  });
});
