import { describe, expect, it } from "vitest";
import {
  discountLabel,
  effectivePrice,
  formatNaira,
  isDiscounted,
  productImages,
  shortId,
} from "./format";

describe("formatNaira", () => {
  it("formats whole naira with separators", () => {
    expect(formatNaira(18483)).toBe("₦18,483");
    expect(formatNaira(0)).toBe("₦0");
    expect(formatNaira(undefined)).toBe("₦0");
  });
});

describe("pricing rules", () => {
  it("charges the sale price whenever one is set (as the API does)", () => {
    expect(effectivePrice({ price: 10000, salePrice: 7500 })).toBe(7500);
    expect(effectivePrice({ price: 10000, salePrice: 0 })).toBe(10000);
    // Legacy record with a "sale" price above the price: still what's charged.
    expect(effectivePrice({ price: 450000, salePrice: 520000 })).toBe(520000);
  });

  it("only treats a lower sale price as a discount", () => {
    expect(isDiscounted({ price: 10000, salePrice: 7500 })).toBe(true);
    expect(isDiscounted({ price: 450000, salePrice: 520000 })).toBe(false);
    expect(isDiscounted({ price: 10000, salePrice: 0 })).toBe(false);
  });

  it("labels discounts like the design (−25%) and never shows negative ones", () => {
    expect(discountLabel({ price: 10000, salePrice: 7500 })).toBe("−25%");
    expect(discountLabel({ price: 450000, salePrice: 520000 })).toBeNull();
  });
});

describe("productImages", () => {
  it("prefers the gallery and falls back to the legacy single image", () => {
    expect(productImages({ image: "a.jpg", images: ["b.jpg", "c.jpg"] })).toEqual([
      "b.jpg",
      "c.jpg",
    ]);
    expect(productImages({ image: "a.jpg", images: [] })).toEqual(["a.jpg"]);
    expect(productImages({ image: "", images: undefined })).toEqual([]);
  });
});

it("shortId shows the last six characters, upper-cased", () => {
  expect(shortId("6800d78d60b1dec26886ead5")).toBe("#86EAD5");
});
