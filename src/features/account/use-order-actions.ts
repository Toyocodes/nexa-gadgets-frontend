import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { paths } from "@/app/paths";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/auth/auth-slice";
import { useAddToCartMutation } from "@/features/cart/cart-api";
import { cartOpened } from "@/features/cart/cart-ui-slice";
import { useLazyGetOrderQuery } from "@/features/checkout/checkout-api";
import { getErrorMessage } from "@/lib/api/errors";
import { PaymentCancelledError, payByTransfer } from "@/lib/paystack";
import type { Order } from "@/types/api";

/**
 * "Complete payment" on an unpaid order: re-read the order (its totalAmount
 * already includes the delivery fee) and reopen the same transfer-only popup.
 */
export function useCompletePayment() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const [getOrder] = useLazyGetOrderQuery();
  const [payingId, setPayingId] = useState<string | null>(null);

  const complete = async (orderId: string) => {
    if (!user) return;
    setPayingId(orderId);
    try {
      const order = await getOrder(orderId).unwrap();
      const reference = await payByTransfer({
        email: user.email,
        amount: order.totalAmount,
        orderId: order._id,
      });
      navigate(
        `${paths.paymentReturn}?reference=${encodeURIComponent(reference)}&order=${order._id}`,
      );
    } catch (err) {
      if (err instanceof PaymentCancelledError) toast("Payment cancelled");
      else toast.error(err instanceof Error ? err.message : getErrorMessage(err));
    } finally {
      setPayingId(null);
    }
  };

  return { complete, payingId };
}

/** "Buy again": add each item back to the cart, then open the drawer. */
export function useBuyAgain() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [addToCart] = useAddToCartMutation();

  return async (order: Order) => {
    if (!user) return;
    const results = await Promise.allSettled(
      order.cartItems.map((item) =>
        addToCart({ userId: user.id, productId: item.productId, quantity: item.quantity }).unwrap(),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === order.cartItems.length) {
      toast.error("Those items aren't available any more");
      return;
    }
    if (failed)
      toast(`${failed} item${failed > 1 ? "s" : ""} couldn't be added — they may be out of stock`);
    dispatch(cartOpened());
  };
}
