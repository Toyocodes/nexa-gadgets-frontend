import { ArrowLeft, PackageSearch } from "lucide-react";
import { Link, useParams } from "react-router";
import { paths } from "@/app/paths";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { useGetOrderQuery } from "@/features/checkout/checkout-api";
import { formatPhone } from "@/features/checkout/address-schema";
import { formatDate, formatNaira, shortId } from "@/lib/format";
import { OrderTracker, StatusPill } from "../components/order-parts";
import { isPickup, isUnpaid } from "../order-status";
import { useBuyAgain, useCompletePayment } from "../use-order-actions";

export default function OrderPage() {
  const { orderId = "" } = useParams();
  const { data: order, isLoading } = useGetOrderQuery(orderId);
  const { complete, payingId } = useCompletePayment();
  const buyAgain = useBuyAgain();

  if (isLoading) return <PageSpinner className="min-h-[30vh]" />;
  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Order not found"
        action={
          <Button asChild variant="outline">
            <Link to={paths.account}>Back to orders</Link>
          </Button>
        }
      />
    );
  }

  const pickup = isPickup(order);
  const unpaid = isUnpaid(order);
  const subtotal = order.subtotal ?? order.totalAmount - (order.deliveryFee ?? 0);

  return (
    <>
      <title>{`Order ${shortId(order._id)} — Nexa Gadgets`}</title>
      <Link
        to={paths.account}
        className="inline-flex h-11 items-center gap-1.5 self-start text-sm text-ink-2 no-underline hover:text-foreground"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" /> All orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-[28px] font-semibold tracking-[-0.02em]">
          {shortId(order._id)}
        </h1>
        <StatusPill order={order} />
      </div>
      <p className="-mt-3 text-sm text-muted-foreground">
        Placed {formatDate(order.orderDate)} · {order.deliveryMethod?.name ?? "Delivery"}
      </p>

      {unpaid ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-warning/30 bg-warning-soft p-5">
          <span className="text-sm font-medium text-warning">
            Payment wasn’t completed. Finish paying to confirm this order.
          </span>
          <Button
            variant="ink"
            size="md"
            disabled={payingId === order._id}
            onClick={() => complete(order._id)}
          >
            Complete payment
          </Button>
        </div>
      ) : (
        order.orderStatus !== "rejected" && (
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <OrderTracker order={order} />
          </div>
        )
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="m-0 list-none p-0">
          {order.cartItems.map((item) => (
            <li
              key={item.productId}
              className="flex items-center gap-4 border-b border-border px-5 py-4 md:px-6"
            >
              <ProductImage
                src={item.image}
                alt=""
                iconSize={28}
                iconStroke={1.2}
                className="size-14 flex-none rounded-md"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to={paths.product(item.productId)}
                  className="text-[15px] font-medium text-foreground hover:text-primary"
                >
                  {item.title}
                </Link>
                <div className="text-[13px] text-muted-foreground">Qty {item.quantity}</div>
              </div>
              <span className="font-mono text-[15px] font-semibold">
                {formatNaira(Number(item.price) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="m-0 flex flex-col gap-2.5 px-5 py-5 text-[15px] text-ink-2 md:px-6">
          <Row label="Subtotal" value={formatNaira(subtotal)} />
          <Row
            label={pickup ? "Pickup" : `Delivery · ${order.deliveryMethod?.name ?? "Lagos"}`}
            value={formatNaira(order.deliveryFee ?? 0)}
          />
          <Row label="Total" value={formatNaira(order.totalAmount)} strong />
        </dl>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard title={pickup ? "Pickup" : "Delivery address"}>
          {pickup ? (
            order.deliveryMethod?.description || "Collect from our store after paying online."
          ) : order.addressInfo?.address ? (
            <>
              {order.addressInfo.address}, {order.addressInfo.city}
              {order.addressInfo.phone && (
                <>
                  <br />
                  {formatPhone(order.addressInfo.phone)}
                </>
              )}
              {order.addressInfo.notes && (
                <>
                  <br />
                  <span className="text-muted-foreground">Notes: {order.addressInfo.notes}</span>
                </>
              )}
            </>
          ) : (
            "—"
          )}
        </InfoCard>
        <InfoCard title="Payment">
          {order.paymentStatus === "paid"
            ? "Paid by bank transfer via Paystack"
            : "Awaiting payment"}
        </InfoCard>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="md" onClick={() => buyAgain(order)}>
          Buy again
        </Button>
        <Button asChild variant="ghost" size="md">
          <a href={site.whatsappUrl} target="_blank" rel="noreferrer">
            Get help with this order
          </a>
        </Button>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-4 ${strong ? "pt-1 text-lg font-semibold text-foreground" : ""}`}
    >
      <dt>{label}</dt>
      <dd className="m-0 font-mono">{value}</dd>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      <p className="text-[15px] leading-normal text-ink-2">{children}</p>
    </div>
  );
}
