import { Lock, ShoppingBag, Truck, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { paths } from "@/app/paths";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { ProductImage } from "@/components/product/product-image";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { brandLabel, LOW_STOCK_THRESHOLD } from "@/config/catalog";
import { selectUser } from "@/features/auth/auth-slice";
import { useGetProductQuery } from "@/features/catalog/catalog-api";
import { getErrorMessage } from "@/lib/api/errors";
import { effectivePrice, formatNaira, isDiscounted } from "@/lib/format";
import type { CartItem } from "@/types/api";
import { useRemoveFromCartMutation, useUpdateCartQuantityMutation } from "../cart-api";
import { cartClosed, selectCartOpen } from "../cart-ui-slice";
import { useCart } from "../use-cart";

export function CartDrawer() {
  const open = useAppSelector(selectCartOpen);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, count, subtotal, savings, isLoading } = useCart();
  const close = () => dispatch(cartClosed());

  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-[460px]">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <SheetTitle className="text-xl font-semibold tracking-[-0.02em]">
            Your cart <span className="font-medium text-muted-foreground">({count})</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Items in your cart and the checkout button
          </SheetDescription>
          <SheetClose
            aria-label="Close cart"
            className="flex size-11 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <X size={20} strokeWidth={2} />
          </SheetClose>
        </div>

        {!user ? (
          <EmptyState
            title="Sign in to see your cart"
            body="Your cart is saved to your account, so it follows you across devices."
            action={
              <Button asChild size="lg" className="w-full">
                <Link to={paths.signIn()} onClick={close}>
                  Sign in
                </Link>
              </Button>
            }
          />
        ) : !isLoading && items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            body="Find something you like and tap + to add it."
            action={
              <Button asChild size="lg" className="w-full">
                <Link to={paths.products()} onClick={close}>
                  Start shopping
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-lg bg-muted px-3.5 py-3 text-sm font-medium text-ink-2">
              <Truck size={18} strokeWidth={1.8} aria-hidden="true" />
              Choose Lagos delivery or store pickup at checkout
            </div>

            <ul className="flex-1 overflow-y-auto px-6 py-2">
              {items.map((item) => (
                <CartLine key={item.productId} item={item} userId={user.id} />
              ))}
            </ul>

            <div className="flex flex-col gap-2.5 border-t border-border px-6 pt-5 pb-6">
              <Row
                label="Subtotal"
                value={<span className="font-mono">{formatNaira(subtotal)}</span>}
              />
              <Row label="Delivery" value="Chosen at checkout" />
              {savings > 0 && (
                <Row
                  className="font-medium text-success"
                  label="You save"
                  value={<span className="font-mono">{formatNaira(savings)}</span>}
                />
              )}
              <Button
                size="xl"
                className="mt-2"
                onClick={() => {
                  close();
                  navigate(paths.checkout);
                }}
              >
                Checkout · <span className="font-mono">{formatNaira(subtotal)}</span>
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="text-[15px] hover:bg-transparent hover:text-primary"
                onClick={close}
              >
                Continue shopping
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
                <Lock size={14} strokeWidth={2} aria-hidden="true" />
                Pay by bank transfer via Paystack
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex justify-between text-[15px] text-ink-2 ${className ?? ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShoppingBag size={28} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-1 text-[15px] text-muted-foreground">{body}</p>
      </div>
      <div className="w-full max-w-[280px]">{action}</div>
    </div>
  );
}

function CartLine({ item, userId }: { item: CartItem; userId: string }) {
  // Cart lines don't carry brand or stock; the product query (shared with the
  // product page cache) fills them in.
  const { data: product } = useGetProductQuery(item.productId);
  const [updateQty] = useUpdateCartQuantityMutation();
  const [remove] = useRemoveFromCartMutation();
  const onSale = isDiscounted(item);
  const stock = product?.totalStock;
  const atMax = stock != null && item.quantity >= stock;

  const setQty = async (quantity: number) => {
    try {
      await updateQty({ userId, productId: item.productId, quantity }).unwrap();
    } catch (e) {
      toast.error(getErrorMessage(e, "Couldn't update the quantity"));
    }
  };

  return (
    <li className="flex gap-4 border-b border-border py-5">
      <ProductImage
        src={item.image}
        alt=""
        category={product?.category}
        iconSize={40}
        iconStroke={1.1}
        className="size-[84px] flex-none rounded-lg"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex justify-between gap-3">
          <div>
            <Link
              to={paths.product(item.productId)}
              className="text-[15px] leading-[1.35] font-medium text-foreground hover:text-primary"
            >
              {item.title}
            </Link>
            {product && (
              <div className="mt-0.5 text-[13px] text-muted-foreground">
                {brandLabel(product.brand)}
              </div>
            )}
          </div>
          <div className="text-right whitespace-nowrap">
            <div className="font-mono text-[15px] font-semibold">
              {formatNaira(effectivePrice(item))}
            </div>
            {onSale && (
              <s className="text-[13px] text-muted-foreground">{formatNaira(item.price)}</s>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            value={item.quantity}
            onDecrease={() =>
              item.quantity > 1
                ? setQty(item.quantity - 1)
                : remove({ userId, productId: item.productId })
            }
            onIncrease={() => setQty(item.quantity + 1)}
            canIncrease={!atMax}
          />
          <Button
            variant="link-muted"
            className="h-11 text-sm"
            onClick={() => remove({ userId, productId: item.productId })}
          >
            Remove
          </Button>
        </div>
        {stock != null && stock > 0 && stock < LOW_STOCK_THRESHOLD && (
          <span className="text-[13px] font-medium text-warning">Only {stock} left</span>
        )}
      </div>
    </li>
  );
}
