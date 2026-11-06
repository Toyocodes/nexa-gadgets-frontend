import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { toast } from "sonner";
import { useAppSelector } from "@/app/store";
import { useCheckAuthQuery } from "@/features/auth/auth-api";
import { selectSessionExpired, selectUser } from "@/features/auth/auth-slice";
import { useMergeGuestCart } from "@/features/cart/use-merge-guest-cart";
import { useAddToWishlistMutation } from "@/features/wishlist/wishlist-api";
import { takePendingIntent } from "@/lib/pending-intent";

/** Finish the wishlist save a guest started before signing in. */
function useResumePendingIntent() {
  const user = useAppSelector(selectUser);
  const [addToWishlist] = useAddToWishlistMutation();

  useEffect(() => {
    if (!user) return;
    const intent = takePendingIntent();
    if (!intent) return;
    addToWishlist({ userId: user.id, productId: intent.productId })
      .unwrap()
      .then(() => toast.success("Saved to your wishlist"))
      .catch(() => undefined); // already saved
  }, [user, addToWishlist]);
}

export function RootLayout() {
  // One session check on load. Public pages render immediately; only guarded
  // routes wait for the answer.
  useCheckAuthQuery();
  useResumePendingIntent();
  useMergeGuestCart();

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
