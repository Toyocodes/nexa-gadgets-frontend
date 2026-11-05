import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { useCheckAuthQuery } from "@/features/auth/auth-api";
import { selectSessionExpired, selectUser } from "@/features/auth/auth-slice";
import { useAddToCartMutation } from "@/features/cart/cart-api";
import { cartOpened } from "@/features/cart/cart-ui-slice";
import { useAddToWishlistMutation } from "@/features/wishlist/wishlist-api";
import { takePendingIntent } from "@/lib/pending-intent";

/** Finish the cart/wishlist action a guest started before signing in. */
function useResumePendingIntent() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();

  useEffect(() => {
    if (!user) return;
    const intent = takePendingIntent();
    if (!intent) return;
    if (intent.type === "cart") {
      addToCart({ userId: user.id, productId: intent.productId, quantity: intent.quantity })
        .unwrap()
        .then(() => {
          toast.success("Added to your cart");
          dispatch(cartOpened());
        })
        .catch(() => toast.error("We couldn't add that item to your cart"));
    } else {
      addToWishlist({ userId: user.id, productId: intent.productId })
        .unwrap()
        .then(() => toast.success("Saved to your wishlist"))
        .catch(() => undefined); // already saved
    }
  }, [user, addToCart, addToWishlist, dispatch]);
}

export function RootLayout() {
  // One session check on load. Public pages render immediately; only guarded
  // routes wait for the answer.
  useCheckAuthQuery();
  useResumePendingIntent();

  const expired = useAppSelector(selectSessionExpired);
  useEffect(() => {
    if (expired) toast("Your session has expired. Please sign in again.");
  }, [expired]);

  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
