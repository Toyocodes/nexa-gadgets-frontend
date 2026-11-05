import { Heart, Plus } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/app/paths";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { CardRating } from "@/components/product/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { brandLabel, LOW_STOCK_THRESHOLD } from "@/config/catalog";
import { useAddToCart } from "@/features/cart/use-cart";
import { useWishlist } from "@/features/wishlist/use-wishlist";
import { discountLabel, productImages } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

interface ProductCardProps {
  product: Product;
  /** "full" is the browse card; "simple" drops heart, stars and stock (related products). */
  variant?: "full" | "simple";
  priority?: boolean;
}

export function ProductCard({ product, variant = "full", priority }: ProductCardProps) {
  const [addToCart, { isLoading: adding }] = useAddToCart();
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product._id);
  const discount = discountLabel(product);
  const outOfStock = product.totalStock <= 0;
  const lowStock = !outOfStock && product.totalStock < LOW_STOCK_THRESHOLD;
  const href = paths.product(product._id);
  const full = variant === "full";

  return (
    <article className="flex flex-col gap-2.5 md:gap-3.5">
      <div className="relative">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <ProductImage
            src={productImages(product)[0]}
            alt=""
            category={product.category}
            loading={priority ? "eager" : "lazy"}
            className="aspect-square rounded-xl md:rounded-2xl"
          />
        </Link>
        {discount && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-foreground px-2 py-1 text-[11px] font-semibold text-white md:top-3.5 md:left-3.5 md:px-2.5 md:py-[5px] md:text-xs">
            {discount}
          </span>
        )}
        {full && (
          <button
            type="button"
            onClick={() => toggle(product._id)}
            aria-label={
              saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`
            }
            aria-pressed={saved}
            className="absolute top-2 right-2 hidden size-11 items-center justify-center rounded-full bg-card text-foreground transition-colors hover:bg-muted md:flex"
          >
            <Heart size={18} strokeWidth={1.8} className={cn(saved && "fill-foreground")} />
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-1">
          <span className="text-xs text-muted-foreground md:text-[13px]">
            {brandLabel(product.brand)}
          </span>
          <Link
            to={href}
            className="text-sm leading-[1.35] font-medium text-foreground hover:text-primary md:text-base"
          >
            {product.title}
          </Link>
          {full && <CardRating average={product.averageReview} count={product.numReviews} />}
          <div className="mt-1 flex items-end justify-between gap-1.5 md:block">
            <Price
              price={product.price}
              salePrice={product.salePrice}
              className="text-[15px] md:text-[17px]"
              wasClassName="text-xs md:text-sm"
            />
            <AddButton
              className="md:hidden"
              title={product.title}
              disabled={outOfStock || adding}
              onClick={() => addToCart(product._id)}
            />
          </div>
          {full && lowStock && (
            <span className="text-[13px] font-medium text-warning">
              Only {product.totalStock} left
            </span>
          )}
          {outOfStock && (
            <span className="text-[13px] font-medium text-muted-foreground">Out of stock</span>
          )}
        </div>
        <AddButton
          className="hidden md:flex"
          title={product.title}
          disabled={outOfStock || adding}
          onClick={() => addToCart(product._id)}
        />
      </div>
    </article>
  );
}

function AddButton({
  title,
  className,
  ...props
}: { title: string } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={`Add ${title} to cart`}
      className={cn(
        "flex size-11 flex-none items-center justify-center rounded-full border border-input bg-card text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <Plus size={18} strokeWidth={2} />
    </button>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-hidden="true">
      <Skeleton className="aspect-square rounded-xl bg-tile md:rounded-2xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-16 bg-tile" />
        <Skeleton className="h-4 w-4/5 bg-tile" />
        <Skeleton className="h-4 w-20 bg-tile" />
      </div>
    </div>
  );
}

/** Responsive grid used by home, listing and related rails. */
export function ProductGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] md:gap-x-6 md:gap-y-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
