import { useState } from "react";
import { ChevronDown, Package } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/app/paths";
import { useAppSelector } from "@/app/store";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { site } from "@/config/site";
import { selectUser } from "@/features/auth/auth-slice";
import { ReviewDialog } from "@/features/catalog/components/review-dialog";
import { useGetOrdersQuery } from "@/features/checkout/checkout-api";
import { formatDate, formatNaira, shortId } from "@/lib/format";
import type { Order, OrderItem } from "@/types/api";
import { OrderThumbs, OrderTracker, StatusPill } from "../components/order-parts";
import { isFinished, isPickup, isUnpaid } from "../order-status";
import { useBuyAgain, useCompletePayment } from "../use-order-actions";

export default function OrdersPage() {
  const user = useAppSelector(selectUser)!;
  const { data: orders = [], isLoading } = useGetOrdersQuery(user.id);
  const [showOlderUnpaid, setShowOlderUnpaid] = useState(false);

  // Every abandoned checkout leaves an unpaid order; show the latest one and
  // tuck the rest away so they don't bury real orders.
  const unpaid = orders.filter(isUnpaid);
  const [latestUnpaid, ...olderUnpaid] = unpaid;
  const placed = orders.filter((o) => !isUnpaid(o));

  return (
    <>
      <title>Orders — Nexa Gadgets</title>
      <h1 className="mb-1 text-[28px] font-semibold tracking-[-0.04em] md:text-4xl">Orders</h1>
      {isLoading ? (
        <PageSpinner className="min-h-[30vh]" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          body="When you buy something, you'll be able to track it here from payment to delivery."
          action={
            <Button asChild>
              <Link to={paths.products()}>Start shopping</Link>
            </Button>
          }
        />
      ) : (
        <>
          {latestUnpaid && <UnpaidCard order={latestUnpaid} />}
          {olderUnpaid.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowOlderUnpaid((v) => !v)}
                aria-expanded={showOlderUnpaid}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-foreground"
              >
                {olderUnpaid.length} older unpaid {olderUnpaid.length === 1 ? "order" : "orders"}
                <ChevronDown
                  size={16}
                  className={showOlderUnpaid ? "rotate-180" : ""}
                  aria-hidden="true"
                />
              </button>
              {showOlderUnpaid && (
                <div className="mt-3 flex flex-col gap-3">
                  {olderUnpaid.map((o) => (
                    <UnpaidCard key={o._id} order={o} compact />
                  ))}
                </div>
              )}
            </div>
          )}
          {placed.map((o) => (
            <OrderCard key={o._id} order={o} />
          ))}
        </>
      )}
    </>
  );
}

function UnpaidCard({ order, compact }: { order: Order; compact?: boolean }) {
  const { complete, payingId } = useCompletePayment();
  return (
    <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={paths.order(order._id)}
            className="font-mono text-[15px] font-semibold text-foreground"
          >
            {shortId(order._id)}
          </Link>
          <StatusPill order={order} />
          {compact && (
            <span className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</span>
          )}
        </div>
        <span className="text-sm text-ink-2">
          {compact
            ? formatNaira(order.totalAmount)
            : "Payment wasn’t completed. Finish paying to confirm this order."}
        </span>
      </div>
      <Button
        variant="ink"
        size="md"
        className="text-[15px]"
        disabled={payingId === order._id}
        onClick={() => complete(order._id)}
      >
        {payingId === order._id ? "Opening Paystack…" : "Complete payment"}
      </Button>
    </article>
  );
}

function OrderCard({ order }: { order: Order }) {
  const finished = isFinished(order);
  const cancelled = order.orderStatus === "rejected";
  const pickup = isPickup(order);
  const buyAgain = useBuyAgain();

  const subline = finished
    ? `${pickup ? "Picked up from store" : "Delivered"} ${formatDate(order.orderUpdateDate ?? order.orderDate)}`
    : `Placed ${formatDate(order.orderDate)} · ${order.deliveryMethod?.name ?? "Delivery"}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={paths.order(order._id)}
            className="font-mono text-[15px] font-semibold text-foreground"
          >
            {shortId(order._id)}
          </Link>
          <StatusPill order={order} />
          <span className="text-sm text-muted-foreground">{subline}</span>
        </div>
        <span className="font-mono text-base font-semibold">{formatNaira(order.totalAmount)}</span>
      </div>

      <div className="flex flex-col gap-6 p-5 md:p-6">
        {!finished && !cancelled && <OrderTracker order={order} />}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <OrderThumbs order={order} />
          <div className="flex flex-wrap gap-2">
            {finished ? (
              <>
                <WriteReviewButton items={order.cartItems} />
                <Button variant="outline" size="md" onClick={() => buyAgain(order)}>
                  Buy again
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="md">
                  <Link to={paths.order(order._id)}>Order details</Link>
                </Button>
                <Button asChild variant="ghost" size="md">
                  <a href={site.whatsappUrl} target="_blank" rel="noreferrer">
                    Get help
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** One item → open the review form; several → pick which product to review. */
function WriteReviewButton({ items }: { items: OrderItem[] }) {
  const [target, setTarget] = useState<OrderItem | null>(null);
  const dialog = target && (
    <ReviewDialog
      productId={target.productId}
      productTitle={target.title}
      open={!!target}
      onOpenChange={(o) => !o && setTarget(null)}
    />
  );

  if (items.length === 1) {
    return (
      <>
        <Button size="md" onClick={() => setTarget(items[0]!)}>
          Write a review
        </Button>
        {dialog}
      </>
    );
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="md">
            Write a review <ChevronDown size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-w-[280px]">
          {items.map((item) => (
            <DropdownMenuItem key={item.productId} onSelect={() => setTarget(item)}>
              {item.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  );
}
