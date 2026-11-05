import { useState } from "react";
import { Package } from "lucide-react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/features/account/components/order-parts";
import { isPickup, isUnpaid } from "@/features/account/order-status";
import { formatPhone } from "@/features/checkout/address-schema";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, formatNaira, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/api";
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from "../admin-api";
import { AdminHeading } from "../components/admin-layout";

const VIEWS = [
  {
    id: "fulfil",
    label: "To fulfil",
    match: (o: Order) => !isUnpaid(o) && !["delivered", "rejected"].includes(o.orderStatus),
  },
  { id: "done", label: "Completed", match: (o: Order) => o.orderStatus === "delivered" },
  // Every abandoned checkout leaves one of these; keep them out of the main list.
  { id: "unpaid", label: "Awaiting payment", match: isUnpaid },
  { id: "cancelled", label: "Cancelled", match: (o: Order) => o.orderStatus === "rejected" },
  { id: "all", label: "All", match: () => true },
] as const;

/** Pickup orders get "Ready for pickup"; delivery orders get "In shipping". */
function statusOptions(order: Order): { value: OrderStatus; label: string }[] {
  const pickup = isPickup(order);
  return [
    { value: "pending", label: "Placed" },
    { value: "confirmed", label: "Confirmed" },
    pickup
      ? { value: "readyForPickup", label: "Ready for pickup" }
      : { value: "inShipping", label: "In shipping" },
    { value: "delivered", label: pickup ? "Collected" : "Delivered" },
    { value: "rejected", label: "Cancelled" },
  ];
}

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useGetAdminOrdersQuery();
  const [params, setParams] = useSearchParams();
  const viewId = params.get("view") ?? "fulfil";
  const view = VIEWS.find((v) => v.id === viewId) ?? VIEWS[0];
  const [managing, setManaging] = useState<Order | null>(null);
  const shown = orders.filter(view.match);

  return (
    <>
      <AdminHeading
        title="Orders"
        description="Update an order's status as it moves from payment to delivery or collection."
      />

      <div
        role="tablist"
        aria-label="Order views"
        className="scrollbar-none flex gap-2 overflow-x-auto"
      >
        {VIEWS.map((v) => {
          const count = orders.filter(v.match).length;
          const active = v.id === view.id;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setParams(v.id === "fulfil" ? {} : { view: v.id }, { replace: true })}
              className={cn(
                "flex h-9 flex-none items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors",
                active
                  ? "border-foreground bg-foreground text-white"
                  : "border-input bg-card hover:border-foreground",
              )}
            >
              {v.label}
              <span className={cn("font-mono", active ? "text-white/70" : "text-muted-foreground")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <PageSpinner className="min-h-[30vh]" />
      ) : shown.length === 0 ? (
        <EmptyState icon={Package} title="Nothing here" body="No orders in this view right now." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="hidden border-b border-border text-left text-[13px] text-muted-foreground md:table-header-group">
              <tr>
                <th className="py-3 pl-5 font-medium">Order</th>
                <th className="py-3 font-medium">Placed</th>
                <th className="py-3 font-medium">Method</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Total</th>
                <th className="py-3 pr-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr
                  key={o._id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border p-4 last:border-0 md:table-row md:p-0"
                >
                  <td className="font-mono font-semibold md:py-3.5 md:pl-5">{shortId(o._id)}</td>
                  <td className="text-ink-2">{formatDate(o.orderDate)}</td>
                  <td className="w-full text-ink-2 md:w-auto">
                    {o.deliveryMethod?.name ?? "Delivery"}
                  </td>
                  <td>
                    <StatusPill order={o} />
                  </td>
                  <td className="ml-auto font-mono font-semibold md:ml-0 md:text-right">
                    {formatNaira(o.totalAmount)}
                  </td>
                  <td className="w-full md:w-auto md:pr-5 md:text-right">
                    <Button
                      variant="outline"
                      size="md"
                      className="h-9 w-full md:w-auto"
                      onClick={() => setManaging(o)}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {managing && (
        <ManageOrderDialog key={managing._id} order={managing} onClose={() => setManaging(null)} />
      )}
    </>
  );
}

function ManageOrderDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const [status, setStatus] = useState<OrderStatus>(
    order.orderStatus === "inProcess" ? "confirmed" : order.orderStatus,
  );
  const [update, { isLoading }] = useUpdateOrderStatusMutation();
  const pickup = isPickup(order);
  const unpaid = isUnpaid(order);

  const save = async () => {
    try {
      await update({ id: order._id, orderStatus: status }).unwrap();
      toast.success(`${shortId(order._id)} updated`);
      onClose();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-2xl sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2.5 font-mono text-xl">
            {shortId(order._id)} <StatusPill order={order} />
          </DialogTitle>
          <DialogDescription>
            Placed {formatDate(order.orderDate)} · {order.deliveryMethod?.name ?? "Delivery"}
          </DialogDescription>
        </DialogHeader>

        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {order.cartItems.map((i) => (
            <li key={i.productId} className="flex items-center gap-3">
              <ProductImage
                src={i.image}
                alt=""
                iconSize={22}
                iconStroke={1.2}
                className="size-12 flex-none rounded-md"
              />
              <span className="flex-1 text-sm">
                {i.title} <span className="text-muted-foreground">× {i.quantity}</span>
              </span>
              <span className="font-mono text-sm font-semibold">
                {formatNaira(Number(i.price) * i.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="m-0 flex flex-col gap-2 rounded-lg bg-muted p-4 text-sm text-ink-2">
          <div className="flex justify-between">
            <dt>{pickup ? "Pickup" : "Delivery fee"}</dt>
            <dd className="m-0 font-mono">{formatNaira(order.deliveryFee ?? 0)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-foreground">
            <dt>Total {unpaid ? "(unpaid)" : "(paid)"}</dt>
            <dd className="m-0 font-mono">{formatNaira(order.totalAmount)}</dd>
          </div>
          {!pickup && order.addressInfo?.address && (
            <div className="border-t border-border pt-2">
              <dt className="text-muted-foreground">Deliver to</dt>
              <dd className="m-0 mt-0.5 text-foreground">
                {order.addressInfo.address}, {order.addressInfo.city}
                {order.addressInfo.phone && ` · ${formatPhone(order.addressInfo.phone)}`}
                {order.addressInfo.notes && (
                  <span className="block text-muted-foreground">
                    Notes: {order.addressInfo.notes}
                  </span>
                )}
              </dd>
            </div>
          )}
        </dl>

        {unpaid && (
          <p className="rounded-lg bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
            This order hasn't been paid. Don't release it until the transfer is confirmed.
          </p>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            Status
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions(order).map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Button
            variant="ink"
            size="md"
            disabled={isLoading || status === order.orderStatus}
            onClick={save}
          >
            {isLoading ? "Saving…" : "Update status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
