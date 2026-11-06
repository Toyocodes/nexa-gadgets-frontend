import { describe, expect, it } from "vitest";
import { toProductSearchParams } from "./catalog-api";
import { specChips } from "./product-specs";
import { listingTitle, priceChipLabel, type ListingFilters } from "./use-listing-filters";

const none: ListingFilters = {
  q: "",
  category: [],
  brand: [],
  inStock: false,
  onSale: false,
  sort: "featured",
};

describe("toProductSearchParams", () => {
  it("serialises filters the way GET /shop/products/get expects", () => {
    const qs = toProductSearchParams({
      category: ["phones", "laptop"],
      brand: ["techno"],
      minPrice: 20000,
      maxPrice: 100000,
      inStock: true,
      onSale: false,
      sortBy: "rating",
      page: 2,
      limit: 12,
    });
    expect(Object.fromEntries(new URLSearchParams(qs))).toEqual({
      category: "phones,laptop",
      brand: "techno",
      minPrice: "20000",
      maxPrice: "100000",
      inStock: "true",
      sortBy: "rating",
      page: "2",
      limit: "12",
    });
  });

  it("omits empty filters", () => {
    expect(toProductSearchParams({ category: [], brand: [] })).toBe("");
  });
});

describe("listingTitle", () => {
  it("names the page after what's being browsed", () => {
    expect(listingTitle(none)).toBe("All products");
    expect(listingTitle({ ...none, category: ["phones"] })).toBe("Phones");
    expect(listingTitle({ ...none, category: ["headphones", "airpods"] })).toBe("Audio");
    expect(listingTitle({ ...none, brand: ["techno"] })).toBe("Tecno");
    expect(listingTitle({ ...none, onSale: true, category: ["phones"] })).toBe("Deals");
  });
});

describe("priceChipLabel", () => {
  it("matches the design's chip wording", () => {
    expect(priceChipLabel(undefined, 20000)).toBe("Under ₦20,000");
    expect(priceChipLabel(20000, 100000)).toBe("₦20,000–₦100,000");
    expect(priceChipLabel(100000, undefined)).toBe("Over ₦100,000");
    expect(priceChipLabel()).toBeNull();
  });
});

describe("specChips", () => {
  it("builds chips like the design: 6.7″ display · 256GB storage · 6GB RAM · 5G", () => {
    expect(
      specChips([
        { label: "Display", value: "6.7″" },
        { label: "Storage", value: "256GB" },
        { label: "Memory (RAM)", value: "6GB" },
        { label: "Network", value: "5G" },
        { label: "Operating system", value: "iOS 15" },
      ]),
    ).toEqual(["6.7″ display", "256GB storage", "6GB RAM", "5G"]);
  });
});
