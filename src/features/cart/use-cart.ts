import { useCallback, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/auth/auth-slice";
import { useGetProductsQuery } from "@/features/catalog/catalog-api";
import { getErrorMessage } from "@/lib/api/errors";
import { effectivePrice, isDiscounted } from "@/lib/format";
import type { CartItem, Product } from "@/types/api";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartQuantityMutation,
} from "./cart-api";
import { cartOpened } from "./cart-ui-slice";
import {
  guestItemAdded,
  guestItemRemoved,
  guestQuantitySet,
  selectGuestItems,
  selectGuestMerge,
  type GuestCartItem,
} from "./guest-cart-slice";

/** A guest's stored ids and quantities, filled in with live product data. */
export function toGuestCartLines(items: GuestCartItem[], products: Product[]): CartItem[] {
  const byId = new Map(products.map((p) => [p._id, p]));
  return items.flatMap(({ productId, quantity }) => {
    const product = byId.get(productId);
    if (!product) return []; // deleted since it was added
    const { image, title, price, salePrice } = product;
    return [{ productId, quantity, image, title, price, salePrice }];
  });
}

/** The cart with the totals the drawer and checkout show, for guests and signed-in users. */
export function useCart() {
  const user = useAppSelector(selectUser);
  const guestItems = useAppSelector(selectGuestItems);
  const merge = useAppSelector(selectGuestMerge);

  // While a merge is due, the account cart isn't final, so hold off reading it.
  const merging = !!user && merge !== "failed" && (guestItems.length > 0 || merge === "merging");
  const accountCart = useGetCartQuery(user && !merging ? user.id : skipToken);
  const guestProducts = useGetProductsQuery(
    !user && guestItems.length > 0 ? { ids: guestItems.map((i) => i.productId) } : skipToken,
  );

  const items = useMemo(() => {
    if (user) return accountCart.data?.items ?? [];
    return toGuestCartLines(guestItems, guestProducts.data?.data ?? []);
  }, [user, accountCart.data, guestItems, guestProducts.data]);

  let subtotal = 0;
  let savings = 0;
  let count = 0;
  for (const item of items) {
    subtotal += effectivePrice(item) * item.quantity;
    if (isDiscounted(item)) savings += (item.price! - item.salePrice!) * item.quantity;
    count += item.quantity;
  }

  return {
    items,
    subtotal,
    savings,
    count,
    userId: user?.id,
    isLoading: merging || (user ? accountCart.isLoading : guestProducts.isLoading),
  };
}

/**
 * Add to cart from anywhere. Guests keep items in this browser until they sign
 * in; signed-in users save to their account. Either way the drawer opens.
 */
export function useAddToCart() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [addToCart, state] = useAddToCartMutation();

  const add = useCallback(
    async (productId: string, quantity = 1, { openDrawer = true } = {}) => {
      try {
        if (user) await addToCart({ userId: user.id, productId, quantity }).unwrap();
        else dispatch(guestItemAdded({ productId, quantity }));
        if (openDrawer) dispatch(cartOpened());
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, "Couldn't add that to your cart"));
        return false;
      }
    },
    [user, addToCart, dispatch],
  );

  return [add, state] as const;
}

/** Change or remove one cart line, wherever that cart lives. */
export function useCartLineActions(productId: string) {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [updateQuantity] = useUpdateCartQuantityMutation();
  const [removeLine] = useRemoveFromCartMutation();

  const setQuantity = async (quantity: number) => {
    if (!user) {
      dispatch(guestQuantitySet({ productId, quantity }));
      return;
    }
    try {
      await updateQuantity({ userId: user.id, productId, quantity }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't update the quantity"));
    }
  };

  const remove = async () => {
    if (!user) {
      dispatch(guestItemRemoved(productId));
      return;
    }
    try {
      await removeLine({ userId: user.id, productId }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't remove that item"));
    }
  };

  return { setQuantity, remove };
}
