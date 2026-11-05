import { Heart, X } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/app/paths";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { Price } from "@/components/product/price";
import { ProductImage } from "@/components/product/product-image";
import { CardRating } from "@/components/product/rating";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/features/cart/use-cart";
import { useWishlist } from "@/features/wishlist/use-wishlist";

export default function WishlistPage() {
  const { entries, isLoading, toggle } = useWishlist();
  const [addToCart] = useAddToCart();

  return (
    <>
      <title>Wishlist — Nexa Gadgets</title>
      <h1 className="mb-1 text-[28px] font-semibold tracking-[-0.04em] md:text-4xl">Wishlist</h1>
      {isLoading ? (
        <PageSpinner className="min-h-[30vh]" />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          body="Tap the heart on any product to keep it here for later."
          action={
            <Button asChild>
              <Link to={paths.products()}>Browse products</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-x-6">
          {entries.map(({ _id, product }) =>
            product ? (
              <article key={_id} className="flex flex-col gap-3">
                <div className="relative">
                  <Link to={paths.product(product._id)} tabIndex={-1} aria-hidden="true">
                    <ProductImage
                      src={product.image}
                      alt=""
                      className="aspect-square rounded-xl md:rounded-2xl"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(product._id)}
                    aria-label={`Remove ${product.title} from wishlist`}
                    className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full bg-card text-foreground hover:bg-muted"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    to={paths.product(product._id)}
                    className="text-sm font-medium text-foreground hover:text-primary md:text-base"
                  >
                    {product.title}
                  </Link>
                  <CardRating average={product.averageReview} count={product.numReviews} />
                  <Price
                    price={product.price}
                    salePrice={product.salePrice}
                    className="text-[15px] md:text-[17px]"
                  />
                </div>
                <Button variant="outline" size="md" onClick={() => addToCart(product._id)}>
                  Add to cart
                </Button>
              </article>
            ) : null,
          )}
        </div>
      )}
    </>
  );
}
