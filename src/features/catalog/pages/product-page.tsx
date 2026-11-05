import { useState } from "react";
import { Heart, PackageSearch, ShoppingBag } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { paths } from "@/app/paths";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { useMobileTitle } from "@/components/layout/mobile-title-context";
import { Price } from "@/components/product/price";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { StarGlyph, StarRow } from "@/components/product/rating";
import { TrustIcon } from "@/components/product/trust-icon";
import { Button } from "@/components/ui/button";
import { brandLabel, categoryLabel } from "@/config/catalog";
import { useAddToCart } from "@/features/cart/use-cart";
import { useGetDeliveryOptionsQuery } from "@/features/checkout/checkout-api";
import { deliverySummary } from "@/features/checkout/delivery";
import { useWishlist } from "@/features/wishlist/use-wishlist";
import { errorStatus } from "@/lib/api/errors";
import { effectivePrice, formatNaira, pluralize, productImages } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";
import { useGetProductQuery, useGetProductsQuery, useGetReviewsQuery } from "../catalog-api";
import { ProductCard, ProductGrid } from "../components/product-card";
import { ProductGallery } from "../components/product-gallery";
import { ProductReviews } from "../components/product-reviews";
import { specChips } from "../product-specs";

export default function ProductPage() {
  const { productId = "" } = useParams();
  const { data: product, isLoading, error } = useGetProductQuery(productId);
  useMobileTitle(product ? categoryLabel(product.category) : "");

  if (isLoading) return <PageSpinner />;
  if (!product) {
    const missing = errorStatus(error) === 404;
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PackageSearch}
          title={missing ? "We couldn't find that product" : "This product didn't load"}
          body={
            missing
              ? "It may have sold out for good or been removed."
              : "Check your connection and try again."
          }
          action={
            <Button asChild>
              <Link to={paths.products()}>Browse all products</Link>
            </Button>
          }
        />
      </div>
    );
  }
  return <ProductView key={product._id} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [addToCart, { isLoading: adding }] = useAddToCart();
  const { isSaved, toggle } = useWishlist();
  const { data: deliveryOptions } = useGetDeliveryOptionsQuery();
  const saved = isSaved(product._id);
  const images = productImages(product);
  const chips = specChips(product.specs);
  const inStock = product.totalStock > 0;
  // numReviews can lag on records the backfill script hasn't touched; trust the loaded reviews too.
  const { data: reviewList = [] } = useGetReviewsQuery(product._id);
  const reviews = Math.max(product.numReviews ?? 0, reviewList.length);
  const average =
    product.averageReview ||
    (reviewList.length ? reviewList.reduce((s, r) => s + r.reviewValue, 0) / reviewList.length : 0);
  const brand = brandLabel(product.brand);

  const buyNow = async () => {
    if (await addToCart(product._id, qty, { openDrawer: false })) navigate(paths.checkout);
  };

  const heart = (className: string, size = 18) => (
    <button
      type="button"
      onClick={() => toggle(product._id)}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={className}
    >
      <Heart size={size} strokeWidth={1.8} className={cn(saved && "fill-foreground")} />
    </button>
  );

  return (
    <div className="pb-6 md:container-page md:pt-6 md:pb-20">
      <title>{`${product.title} — Nexa Gadgets`}</title>
      <nav
        aria-label="Breadcrumb"
        className="hidden flex-wrap gap-2 text-sm text-muted-foreground md:flex"
      >
        <Link to={paths.home} className="text-muted-foreground no-underline hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={paths.products({ category: product.category })}
          className="text-muted-foreground no-underline hover:text-foreground"
        >
          {categoryLabel(product.category)}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground" aria-current="page">
          {product.title}
        </span>
      </nav>

      <div className="flex flex-col gap-6 md:mt-5 md:flex-row md:flex-wrap md:items-start md:gap-12">
        <ProductGallery
          images={images}
          title={product.title}
          category={product.category}
          mobileOverlay={heart(
            "absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-card text-foreground",
          )}
        />

        {/* Buy box */}
        <div className="flex min-w-0 flex-col gap-3.5 px-4 md:flex-[1_1_420px] md:gap-5 md:px-0">
          <div className="flex flex-col gap-3.5 md:gap-2">
            <Link
              to={paths.products({ brand: product.brand })}
              className="self-start text-sm font-medium"
            >
              {brand}
            </Link>
            <h1 className="-mt-1.5 text-[28px] leading-[1.1] font-semibold tracking-[-0.035em] md:mt-0 md:text-[40px] md:leading-[1.05] md:tracking-[-0.04em]">
              {product.title}
            </h1>
            {reviews > 0 && (
              <a
                href="#reviews"
                className="flex items-center gap-1.5 text-sm text-ink-2 no-underline md:gap-2"
              >
                <StarRow value={average} size={15} className="hidden md:flex" />
                <StarGlyph size={15} filled className="md:hidden" />
                {average.toFixed(1)} · {pluralize(reviews, "review")}
              </a>
            )}
          </div>

          <Price
            price={product.price}
            salePrice={product.salePrice}
            className="text-[28px] tracking-[-0.02em] md:text-[34px]"
            wasClassName="text-base"
          />

          {chips.length > 0 && (
            <ul
              aria-label="Key specs"
              className="m-0 flex list-none flex-wrap gap-1.5 p-0 md:gap-2"
            >
              {chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] md:px-3.5 md:py-2 md:text-sm"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}

          <div
            className={cn(
              "flex items-center gap-2 text-sm font-medium md:text-[15px]",
              inStock ? "text-success" : "text-destructive",
            )}
          >
            <span
              className={cn("size-2 rounded-full", inStock ? "bg-success" : "bg-destructive")}
              aria-hidden="true"
            />
            {inStock ? `In stock · ${product.totalStock} available` : "Out of stock"}
          </div>

          {/* Desktop actions */}
          <div className="hidden flex-col gap-3 md:flex">
            <div className="flex flex-wrap gap-3">
              <QuantityStepper
                size="lg"
                value={qty}
                onDecrease={() => setQty((q) => Math.max(1, q - 1))}
                onIncrease={() => setQty((q) => Math.min(product.totalStock, q + 1))}
                canDecrease={qty > 1}
                canIncrease={qty < product.totalStock}
              />
              <Button
                size="lg"
                className="flex-[1_1_200px]"
                disabled={!inStock || adding}
                onClick={() => addToCart(product._id, qty)}
              >
                <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />
                Add to cart
              </Button>
              {heart(
                "flex size-13 items-center justify-center rounded-lg border border-input bg-card text-foreground hover:bg-muted",
              )}
            </div>
            <Button variant="outline-ink" size="lg" disabled={!inStock || adding} onClick={buyNow}>
              Buy now
            </Button>
          </div>

          {/* Trust */}
          <div className="mt-2.5 flex flex-col rounded-2xl border border-border bg-card md:mt-0">
            <TrustRow
              icon="delivery"
              title="Delivery or pickup"
              mobileTitle="Lagos delivery or store pickup"
              detail={deliverySummary(deliveryOptions)}
            />
            <TrustRow
              icon="warranty"
              title="Manufacturer warranty"
              detail={`Genuine ${brand} product`}
            />
            <TrustRow
              icon="returns"
              title="7-day returns"
              detail="Return it unused within 7 days"
            />
            <TrustRow
              icon="payment"
              title="Secure payment"
              detail="Bank transfer via Paystack"
              desktopOnly
            />
          </div>
        </div>
      </div>

      <Specifications product={product} />
      <ProductReviews product={product} />
      <Related product={product} />

      {/* Mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] md:hidden">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-mono text-lg font-semibold">
            {formatNaira(effectivePrice(product))}
          </span>
        </div>
        <Button
          size="lg"
          className="flex-1"
          disabled={!inStock || adding}
          onClick={() => addToCart(product._id)}
        >
          {inStock ? "Add to cart" : "Out of stock"}
        </Button>
      </div>
    </div>
  );
}

function TrustRow(props: {
  icon: "delivery" | "warranty" | "returns" | "payment";
  title: string;
  mobileTitle?: string;
  detail: string;
  desktopOnly?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 md:items-start md:gap-3.5 md:px-5 md:py-4",
        props.desktopOnly && "hidden md:flex",
        // On mobile the payment row is hidden, so returns is the visual last row.
        props.icon === "returns" && "border-b-0 md:border-b",
      )}
    >
      <TrustIcon
        name={props.icon}
        size={22}
        strokeWidth={1.6}
        className="hidden text-foreground md:block"
      />
      <TrustIcon name={props.icon} size={20} strokeWidth={1.8} className="text-primary md:hidden" />
      <div>
        <div className="hidden text-[15px] font-semibold md:block">{props.title}</div>
        <div className="text-sm font-medium md:hidden">{props.mobileTitle ?? props.title}</div>
        <div className="mt-0.5 hidden text-sm text-muted-foreground md:block">{props.detail}</div>
      </div>
    </div>
  );
}

function Specifications({ product }: { product: Product }) {
  const specs = product.specs ?? [];
  return (
    <section className="mt-8 flex flex-wrap gap-x-12 gap-y-3 px-4 md:mt-20 md:gap-y-6 md:px-0">
      <h2 className="flex-[1_1_240px] text-xl font-semibold tracking-[-0.03em] md:text-[28px]">
        {specs.length ? "Specifications" : "About this product"}
      </h2>
      {specs.length ? (
        <dl className="m-0 flex-[999_1_560px] overflow-hidden rounded-2xl border border-border bg-card">
          {specs.map((s) => (
            <div
              key={s.label}
              className="flex justify-between gap-x-6 gap-y-1 border-b border-border px-4 py-3.5 text-sm last:border-b-0 md:flex-wrap md:justify-start md:px-6 md:py-4 md:text-[15px]"
            >
              <dt className="text-muted-foreground md:flex-[0_0_180px]">{s.label}</dt>
              <dd className="m-0 text-right font-medium md:flex-1 md:text-left">{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="m-0 flex-[999_1_560px] rounded-2xl border border-border bg-card px-4 py-3.5 text-sm leading-relaxed whitespace-pre-line text-ink-2 md:px-6 md:py-5 md:text-[15px]">
          {product.description}
        </p>
      )}
    </section>
  );
}

function Related({ product }: { product: Product }) {
  const { data } = useGetProductsQuery({
    category: [product.category],
    sortBy: "rating",
    page: 1,
    limit: 5,
  });
  const related = (data?.data ?? []).filter((p) => p._id !== product._id).slice(0, 4);
  if (!related.length) return null;
  return (
    <section className="mt-12 px-4 md:mt-20 md:px-0">
      <h2 className="mb-3.5 text-xl font-semibold tracking-[-0.03em] md:mb-5 md:text-[28px]">
        You might also like
      </h2>
      <ProductGrid>
        {related.map((p) => (
          <ProductCard key={p._id} product={p} variant="simple" />
        ))}
      </ProductGrid>
    </section>
  );
}
