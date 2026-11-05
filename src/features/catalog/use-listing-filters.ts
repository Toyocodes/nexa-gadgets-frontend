import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  AUDIO_CATEGORIES,
  brandLabel,
  categoryLabel,
  PAGE_SIZE,
  sortByFor,
} from "@/config/catalog";
import { formatNaira } from "@/lib/format";
import type { ProductQuery } from "@/types/api";

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const num = (v: string | null) => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export interface ListingFilters {
  category: string[];
  brand: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  onSale: boolean;
  sort: string;
}

/**
 * Listing filters live in the URL (?category=phones&max=20000&inStock=1), so
 * filtered views are shareable and the back button works. Any change resets
 * "Load more" to page 1 because the query key changes.
 */
export function useListingFilters() {
  const [params, setParams] = useSearchParams();

  const filters: ListingFilters = useMemo(
    () => ({
      category: list(params.get("category")),
      brand: list(params.get("brand")),
      minPrice: num(params.get("min")),
      maxPrice: num(params.get("max")),
      inStock: params.get("inStock") === "1",
      onSale: params.get("onSale") === "1",
      sort: params.get("sort") ?? "featured",
    }),
    [params],
  );

  const query: Omit<ProductQuery, "page"> = useMemo(
    () => ({
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock,
      onSale: filters.onSale,
      sortBy: sortByFor(filters.sort),
      limit: PAGE_SIZE,
    }),
    [filters],
  );

  const update = useCallback(
    (patch: Partial<ListingFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const set = (key: string, value: string | undefined) =>
            value ? next.set(key, value) : next.delete(key);
          if ("category" in patch) set("category", patch.category?.join(","));
          if ("brand" in patch) set("brand", patch.brand?.join(","));
          if ("minPrice" in patch)
            set("min", patch.minPrice != null ? String(patch.minPrice) : undefined);
          if ("maxPrice" in patch)
            set("max", patch.maxPrice != null ? String(patch.maxPrice) : undefined);
          if ("inStock" in patch) set("inStock", patch.inStock ? "1" : undefined);
          if ("onSale" in patch) set("onSale", patch.onSale ? "1" : undefined);
          if ("sort" in patch) set("sort", patch.sort === "featured" ? undefined : patch.sort);
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setParams],
  );

  const clearAll = useCallback(
    () =>
      setParams(filters.sort === "featured" ? {} : { sort: filters.sort }, {
        replace: true,
        preventScrollReset: true,
      }),
    [setParams, filters.sort],
  );

  return { filters, query, update, clearAll };
}

/** Page heading for the current filters: "Phones", "Deals", "Apple", "All products"… */
export function listingTitle(f: ListingFilters) {
  if (f.onSale) return "Deals";
  const isAudio =
    f.category.length === AUDIO_CATEGORIES.length &&
    AUDIO_CATEGORIES.every((c) => f.category.includes(c));
  if (isAudio) return "Audio";
  if (f.category.length === 1 && f.brand.length === 0) return categoryLabel(f.category[0]!);
  if (f.brand.length === 1 && f.category.length === 0) return brandLabel(f.brand[0]!);
  return "All products";
}

export function priceChipLabel(min?: number, max?: number) {
  if (min == null && max == null) return null;
  if (min == null || min === 0) return `Under ${formatNaira(max)}`;
  if (max == null) return `Over ${formatNaira(min)}`;
  return `${formatNaira(min)}–${formatNaira(max)}`;
}
