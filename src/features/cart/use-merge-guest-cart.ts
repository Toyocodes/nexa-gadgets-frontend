import { useEffect } from "react";
import { useStore } from "react-redux";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector, type RootState } from "@/app/store";
import { selectUser } from "@/features/auth/auth-slice";
import { getErrorMessage } from "@/lib/api/errors";
import { pluralize } from "@/lib/format";
import type { CartAdjustment } from "@/types/api";
import { cartApi, useMergeCartMutation } from "./cart-api";
import {
  guestMergeFailed,
  guestMergeStarted,
  guestMergeSucceeded,
  selectGuestItems,
  selectGuestMerge,
} from "./guest-cart-slice";

/** What to tell the customer when the cart they built differs from what we could add. */
export function adjustmentMessage(adjustments: CartAdjustment[]) {
  if (adjustments.length === 1) {
    const [a] = adjustments as [CartAdjustment];
    if (a.quantity > 0 && a.title) return `Only ${a.quantity} of ${a.title} are available`;
    return `${a.title ?? "An item in your cart"} is no longer available`;
  }
  return `${pluralize(adjustments.length, "item")} changed because of limited stock`;
}

/** After sign-in, move what the visitor added as a guest into their account cart. */
export function useMergeGuestCart() {
  const user = useAppSelector(selectUser);
  const hasItems = useAppSelector(selectGuestItems).length > 0;
  const store = useStore<RootState>();
  const dispatch = useAppDispatch();
  const [mergeCart] = useMergeCartMutation();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || !hasItems) return;
    // Read fresh state: effects can run twice, and the merge must only start once.
    const state = store.getState();
    if (selectGuestMerge(state) !== "idle") return;
    const items = selectGuestItems(state);
    dispatch(guestMergeStarted());

    mergeCart({ items })
      .unwrap()
      .then(async ({ data, adjustments }) => {
        // Fill the cache before clearing the flag, so checkout never flashes an empty cart.
        await dispatch(cartApi.util.upsertQueryData("getCart", userId, data));
        dispatch(guestMergeSucceeded());
        if (adjustments.length) toast(adjustmentMessage(adjustments));
        else toast.success("We've added your items to your cart");
      })
      .catch((error: unknown) => {
        dispatch(guestMergeFailed());
        toast.error(getErrorMessage(error, "We couldn't move your items to your cart"));
      });
  }, [userId, hasItems, store, dispatch, mergeCart]);
}
