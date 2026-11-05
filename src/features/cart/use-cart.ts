import { useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/auth/auth-slice";
import { useSignInRedirect } from "@/features/auth/use-sign-in-redirect";
import { getErrorMessage } from "@/lib/api/errors";
import { effectivePrice, isDiscounted } from "@/lib/format";
import { savePendingIntent } from "@/lib/pending-intent";
import { useAddToCartMutation, useGetCartQuery } from "./cart-api";
import { cartOpened } from "./cart-ui-slice";

/** The signed-in user's cart with the totals the drawer and checkout show. */
export function useCart() {
  const user = useAppSelector(selectUser);
  const query = useGetCartQuery(user ? user.id : skipToken);
  const items = user ? (query.data?.items ?? []) : [];

  let subtotal = 0;
  let savings = 0;
  let count = 0;
  for (const item of items) {
    subtotal += effectivePrice(item) * item.quantity;
    if (isDiscounted(item)) savings += (item.price! - item.salePrice!) * item.quantity;
    count += item.quantity;
  }

  return { ...query, items, subtotal, savings, count, userId: user?.id };
}

/**
 * Add to cart from anywhere. Guests are sent to sign in and the item is added
 * when they return; signed-in users see the cart drawer open.
 */
export function useAddToCart() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const redirectToSignIn = useSignInRedirect();
  const [addToCart, state] = useAddToCartMutation();

  const add = useCallback(
    async (productId: string, quantity = 1, { openDrawer = true } = {}) => {
      if (!user) {
        savePendingIntent({ type: "cart", productId, quantity });
        toast("Sign in to add items to your cart");
        redirectToSignIn();
        return false;
      }
      try {
        await addToCart({ userId: user.id, productId, quantity }).unwrap();
        if (openDrawer) dispatch(cartOpened());
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, "Couldn't add that to your cart"));
        return false;
      }
    },
    [user, addToCart, dispatch, redirectToSignIn],
  );

  return [add, state] as const;
}
