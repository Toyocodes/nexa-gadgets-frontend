import type { Product } from "@/types/api";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

/** ₦18,483 — prices are whole naira everywhere in the API. */
export function formatNaira(amount: number | null | undefined) {
  return `₦${naira.format(Math.round(amount ?? 0))}`;
}

/** Compact form for filter chips: ₦20k, ₦1.5m. */
export function formatNairaShort(amount: number) {
  if (amount >= 1_000_000) return `₦${+(amount / 1_000_000).toFixed(1)}m`;
  if (amount >= 1_000) return `₦${+(amount / 1_000).toFixed(1)}k`;
  return `₦${amount}`;
}

/** Price the customer actually pays — the server charges salePrice whenever it's set. */
export function effectivePrice(p: { price: number | null; salePrice: number | null }) {
  return p.salePrice && p.salePrice > 0 ? p.salePrice : (p.price ?? 0);
}

/**
 * A real discount: a sale price below the regular price. (Some legacy records
 * have a "sale" price above the price; that's charged, but it isn't a deal.)
 */
export function isDiscounted(p: { price: number | null; salePrice: number | null }) {
  return !!p.salePrice && p.salePrice > 0 && !!p.price && p.salePrice < p.price;
}

/** −25% badge for products on sale, or null. */
export function discountLabel(p: Pick<Product, "price" | "salePrice">) {
  if (!isDiscounted(p)) return null;
  return `−${Math.round(((p.price - p.salePrice) / p.price) * 100)}%`;
}

/** #7B12C9 — the last six characters of a Mongo id, the way the design shows orders. */
export function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

const dateFmt = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
}

export function pluralize(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** Product photos: use the gallery, fall back to the legacy single image. */
export function productImages(p: Pick<Product, "image" | "images">) {
  const list = p.images?.filter(Boolean) ?? [];
  return list.length ? list : p.image ? [p.image] : [];
}
