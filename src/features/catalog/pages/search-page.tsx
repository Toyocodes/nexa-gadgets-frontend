import { SearchX } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { paths } from "@/app/paths";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import { useSearchProductsQuery } from "../catalog-api";
import { ProductCard, ProductCardSkeleton, ProductGrid } from "../components/product-card";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const { data = [], isFetching, isError } = useSearchProductsQuery(q || skipToken);

  return (
    <div className="container-page pt-6 pb-20">
      <title>{q ? `“${q}” — Nexa Gadgets` : "Search — Nexa Gadgets"}</title>
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted-foreground">
        <Link to={paths.home} className="text-muted-foreground no-underline hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">Search</span>
      </nav>
      <div className="mt-3 mb-7">
        <h1 className="text-[32px] font-semibold tracking-[-0.04em] md:text-[40px]">
          {q ? <>Results for “{q}”</> : "Search"}
        </h1>
        {q && !isFetching && (
          <p className="mt-1.5 text-[15px] text-muted-foreground" aria-live="polite">
            {pluralize(data.length, "product")}
          </p>
        )}
      </div>

      {!q ? (
        <EmptyState
          title="What are you looking for?"
          body="Search by product name, brand or category."
        />
      ) : isFetching ? (
        <ProductGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </ProductGrid>
      ) : isError || data.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No results for “${q}”`}
          body="Check the spelling, or try a broader term like “phone” or “Oraimo”."
          action={
            <Button asChild variant="outline">
              <Link to={paths.products()}>Browse all products</Link>
            </Button>
          }
        />
      ) : (
        <ProductGrid>
          {data.map((p, i) => (
            <ProductCard key={p._id} product={p} priority={i < 4} />
          ))}
        </ProductGrid>
      )}
    </div>
  );
}
