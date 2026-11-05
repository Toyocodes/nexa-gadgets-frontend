import { useCallback, useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { paths } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { getErrorMessage } from "@/lib/api/errors";
import { formatNaira, shortId } from "@/lib/format";
import { ORDER_STORAGE_KEY } from "@/lib/paystack";
import type { Order } from "@/types/api";
import { useVerifyPaymentMutation } from "../checkout-api";
import { CheckoutHeader, CheckoutSteps } from "../components/checkout-chrome";

function storedOrderId() {
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string) : null;
  } catch {
    return null;
  }
}

type State =
  { kind: "verifying" } | { kind: "done"; order: Order } | { kind: "failed"; message: string };

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const reference = params.get("reference");
  const orderId = params.get("order") ?? storedOrderId();
  const [verify] = useVerifyPaymentMutation();
  const [state, setState] = useState<State>({ kind: "verifying" });
  const started = useRef(false);

  const run = useCallback(async () => {
    if (!reference || !orderId) {
      setState({
        kind: "failed",
        message: "We couldn't find the payment to confirm. Check your orders to see its status.",
      });
      return;
    }
    setState({ kind: "verifying" });
    try {
      // Safe to retry: verifying an already-paid order succeeds.
      const res = await verify({ reference, orderId }).unwrap();
      sessionStorage.removeItem(ORDER_STORAGE_KEY);
      setState({ kind: "done", order: res.data });
    } catch (err) {
      setState({
        kind: "failed",
        message: getErrorMessage(err, "We couldn't confirm your payment yet."),
      });
    }
  }, [reference, orderId, verify]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  }, [run]);

  return (
    <div className="min-h-svh bg-background">
      <title>Payment — Nexa Gadgets</title>
      <CheckoutHeader title="Payment" />
      <main className="mx-auto max-w-[640px] px-4 pt-6 pb-20 md:px-10 md:pt-10">
        <CheckoutSteps current={state.kind === "done" ? 2 : 1} />
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 md:mt-0 md:p-10">
          {state.kind === "verifying" && (
            <div role="status" className="flex flex-col items-center gap-4 py-8 text-center">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.03em]">
                  Confirming your payment…
                </h1>
                <p className="mt-1 text-muted-foreground">
                  This usually takes a few seconds. Please don't close this page.
                </p>
              </div>
            </div>
          )}

          {state.kind === "done" && <Confirmed order={state.order} />}

          {state.kind === "failed" && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
                <CircleAlert size={28} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.03em]">
                  We couldn't confirm this payment
                </h1>
                <p
                  role="alert"
                  className="mx-auto mt-2 max-w-md text-[15px] leading-normal text-ink-2"
                >
                  {state.message}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Paid already?{" "}
                  <a href={site.whatsappUrl} target="_blank" rel="noreferrer">
                    Message us on WhatsApp
                  </a>{" "}
                  with your order number and we'll sort it out.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {reference && orderId && <Button onClick={run}>Check again</Button>}
                <Button asChild variant="outline">
                  <Link to={paths.account}>Go to my orders</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Confirmed({ order }: { order: Order }) {
  const pickup = order.deliveryMethod?.type === "pickup";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck size={28} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.04em]">Order confirmed</h1>
          <p className="mt-1 text-[15px] text-ink-2">
            Thanks! We've received your transfer for order{" "}
            <span className="font-mono font-semibold">{shortId(order._id)}</span>.
          </p>
        </div>
      </div>

      <dl className="m-0 flex flex-col gap-2.5 rounded-xl bg-muted p-5 text-[15px] text-ink-2">
        <div className="flex justify-between gap-4">
          <dt>{pickup ? "Collection" : "Delivery"}</dt>
          <dd className="m-0 text-right font-medium text-foreground">
            {order.deliveryMethod?.name ?? "Delivery"}
          </dd>
        </div>
        {!pickup && order.addressInfo?.address && (
          <div className="flex justify-between gap-4">
            <dt>Address</dt>
            <dd className="m-0 text-right">
              {[order.addressInfo.address, order.addressInfo.city].filter(Boolean).join(", ")}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-border pt-2.5 font-semibold text-foreground">
          <dt>Paid</dt>
          <dd className="m-0 font-mono">{formatNaira(order.totalAmount)}</dd>
        </div>
      </dl>

      <p className="text-center text-sm leading-normal text-muted-foreground">
        {pickup
          ? `We'll let you know when it's ready to collect. ${order.deliveryMethod?.description ?? ""}`
          : "We'll call the number on your address when the rider is on the way."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link to={paths.order(order._id)}>Track this order</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to={paths.products()}>Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
