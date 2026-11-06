import { SlidersHorizontal, X, SearchX } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/app/paths";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { brandLabel, categoryLabel, PAGE_SIZE, SORT_OPTIONS } from "@/config/catalog";
import { getErrorMessage } from "@/lib/api/errors";
import { pluralize } from "@/lib/format";
import { useBrowseProductsInfiniteQuery } from "../catalog-api";
import { FiltersPanel } from "../components/listing-filters";
import { ProductCard, ProductCardSkeleton, ProductGrid } from "../components/product-card";
import {
  listingTitle,
  priceChipLabel,
  useListingFilters,
  type ListingFilters,
} from "../use-listing-filters";

export default function ListingPage() {
  const { filters, query, update, clearAll } = useListingFilters();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useBrowseProductsInfiniteQuery(query);

  const products = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.pagination?.total ?? products.length;
  const title = listingTitle(filters);
  const chips = activeChips(filters, update);
  // The search term is shown in the heading and isn't removed by "Clear all".
  const filterCount = chips.filter((c) => c.key !== "search").length;

  return (
    <div className="container-page pt-6 pb-20">
      <title>{`${title} — Nexa Gadgets`}</title>
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted-foreground">
        <Link to={paths.home} className="text-muted-foreground no-underline hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground" aria-current="page">
          {title}
        </span>
      </nav>

      <div className="mt-3 mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.04em] md:text-[40px]">{title}</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground" aria-live="polite">
            {isLoading ? " " : pluralize(total, "product")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MobileFilters
            filters={filters}
            update={update}
            clearAll={clearAll}
            count={filterCount}
          />
          <label className="flex items-center gap-2.5 text-sm text-ink-2">
            <span className="hidden sm:inline">Sort by</span>
            <Select value={filters.sort} onValueChange={(sort) => update({ sort })}>
              <SelectTrigger aria-label="Sort by" className="min-w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-10">
        <aside aria-label="Filters" className="hidden max-w-[280px] flex-[1_1_240px] md:block">
          <FiltersPanel filters={filters} update={update} clearAll={clearAll} />
        </aside>

        <section aria-label="Results" className="min-w-0 flex-[999_1_560px]">
          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-input bg-card pr-2.5 pl-3.5 text-[13px] text-foreground hover:border-foreground"
                >
                  {chip.label}
                  <X size={14} strokeWidth={2} aria-label="Remove filter" role="img" />
                </button>
              ))}
            </div>
          )}

          {isError ? (
            <EmptyState
              title="We couldn't load products"
              body={getErrorMessage(error)}
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          ) : !isLoading && products.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={
                filters.q && filterCount === 0
                  ? `No results for “${filters.q}”`
                  : "No products match these filters"
              }
              body={
                filters.q && filterCount === 0
                  ? "Check the spelling, or try a broader term like “phone” or “Oraimo”."
                  : "Try removing a filter or widening the price range."
              }
              action={
                filters.q && filterCount === 0 ? (
                  <Button asChild variant="outline">
                    <Link to={paths.products()}>Browse all products</Link>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={clearAll}>
                    Clear all filters
                  </Button>
                )
              }
            />
          ) : (
            <ProductGrid className="md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
              {isLoading
                ? Array.from({ length: PAGE_SIZE / 2 }, (_, i) => <ProductCardSkeleton key={i} />)
                : products.map((p, i) => <ProductCard key={p._id} product={p} priority={i < 4} />)}
            </ProductGrid>
          )}

          {products.length > 0 && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Showing {products.length} of {total}
              </span>
              <div className="h-1 w-[200px] rounded-full bg-border" aria-hidden="true">
                <div
                  className="h-1 rounded-full bg-foreground transition-[width]"
                  style={{
                    width: `${Math.min(100, (products.length / Math.max(total, 1)) * 100)}%`,
                  }}
                />
              </div>
              {hasNextPage && (
                <Button
                  variant="outline"
                  className="mt-2 h-12 font-medium"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage || isFetching}
                >
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function activeChips(f: ListingFilters, update: (p: Partial<ListingFilters>) => void) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (f.q) chips.push({ key: "search", label: `“${f.q}”`, remove: () => update({ q: undefined }) });
  if (f.inStock)
    chips.push({ key: "stock", label: "In stock only", remove: () => update({ inStock: false }) });
  if (f.onSale)
    chips.push({ key: "sale", label: "On sale", remove: () => update({ onSale: false }) });
  const price = priceChipLabel(f.minPrice, f.maxPrice);
  if (price)
    chips.push({
      key: "price",
      label: price,
      remove: () => update({ minPrice: undefined, maxPrice: undefined }),
    });
  for (const c of f.category)
    chips.push({
      key: `c-${c}`,
      label: categoryLabel(c),
      remove: () => update({ category: f.category.filter((x) => x !== c) }),
    });
  for (const b of f.brand)
    chips.push({
      key: `b-${b}`,
      label: brandLabel(b),
      remove: () => update({ brand: f.brand.filter((x) => x !== b) }),
    });
  return chips;
}

function MobileFilters(props: React.ComponentProps<typeof FiltersPanel> & { count: number }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="md" className="md:hidden">
          <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
          Filters{props.count > 0 && ` · ${props.count}`}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85svh] gap-0 overflow-y-auto rounded-t-3xl px-5 pt-6 pb-8"
      >
        <SheetTitle className="sr-only">Filters</SheetTitle>
        <SheetDescription className="sr-only">Narrow the product list</SheetDescription>
        <FiltersPanel {...props} />
      </SheetContent>
    </Sheet>
  );
}
