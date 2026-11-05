import type { SortKey } from "@/types/api";

/**
 * Category and brand ids are the values stored in the database — they must
 * not change. Labels are what the redesign shows.
 */
export const CATEGORIES = [
  { id: "phones", label: "Phones", kind: "phone" },
  { id: "laptop", label: "Laptops", kind: "laptop" },
  { id: "headphones", label: "Headphones", kind: "headphones" },
  { id: "airpods", label: "Earbuds", kind: "earbuds" },
  { id: "smartwatch", label: "Smartwatches", kind: "watch" },
  { id: "powerbanks", label: "Power banks", kind: "power" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type CategoryKind = (typeof CATEGORIES)[number]["kind"];

// Note: the Tecno id is "techno" in the database.
export const BRANDS = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "oraimo", label: "Oraimo" },
  { id: "techno", label: "Tecno" },
  { id: "huawei", label: "Huawei" },
  { id: "dell", label: "Dell" },
  { id: "hp", label: "HP" },
] as const;

export const AUDIO_CATEGORIES: CategoryId[] = ["headphones", "airpods"];

export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
export const categoryKind = (id: string): CategoryKind =>
  CATEGORIES.find((c) => c.id === id)?.kind ?? "phone";
export const brandLabel = (id: string) => BRANDS.find((b) => b.id === id)?.label ?? id;

/** Sort menu. `value` goes in the URL; `sortBy` is what the API receives. */
export const SORT_OPTIONS: { value: string; label: string; sortBy: SortKey }[] = [
  // "Featured" shows the newest stock first, per the integration guide.
  { value: "featured", label: "Featured", sortBy: "newest" },
  { value: "price-lowtohigh", label: "Price: low to high", sortBy: "price-lowtohigh" },
  { value: "price-hightolow", label: "Price: high to low", sortBy: "price-hightolow" },
  { value: "newest", label: "Newest", sortBy: "newest" },
  { value: "rating", label: "Top rated", sortBy: "rating" },
];

export const sortByFor = (value: string | null): SortKey =>
  SORT_OPTIONS.find((o) => o.value === value)?.sortBy ?? "newest";

export const PRICE_PRESETS = [
  { label: "Under ₦20k", min: undefined, max: 20_000 },
  { label: "₦20k–₦100k", min: 20_000, max: 100_000 },
  { label: "₦100k+", min: 100_000, max: undefined },
] as const;

/** "Only N left" appears under this stock level. */
export const LOW_STOCK_THRESHOLD = 10;

export const PAGE_SIZE = 12;
