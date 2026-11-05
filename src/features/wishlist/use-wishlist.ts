import { useCallback, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import { useAppSelector } from "@/app/store";
import { selectUser } from "@/features/auth/auth-slice";
import { useSignInRedirect } from "@/features/auth/use-sign-in-redirect";
import { getErrorMessage } from "@/lib/api/errors";
import { savePendingIntent } from "@/lib/pending-intent";
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "./wishlist-api";

/** Saved product ids plus a toggle that works for guests too (via sign-in). */
export function useWishlist() {
  const user = useAppSelector(selectUser);
  const query = useGetWishlistQuery(user ? user.id : skipToken);
  const [add] = useAddToWishlistMutation();
  const [remove] = useRemoveFromWishlistMutation();
  const redirectToSignIn = useSignInRedirect();

  const savedIds = useMemo(
    () => new Set((query.data ?? []).map((e) => e.product?._id).filter(Boolean) as string[]),
    [query.data],
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        savePendingIntent({ type: "wishlist", productId });
        toast("Sign in to save items to your wishlist");
        redirectToSignIn();
        return;
      }
      const saved = savedIds.has(productId);
      try {
        if (saved) {
          await remove({ userId: user.id, productId }).unwrap();
          toast("Removed from your wishlist");
        } else {
          await add({ userId: user.id, productId }).unwrap();
          toast.success("Saved to your wishlist");
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Couldn't update your wishlist"));
      }
    },
    [user, savedIds, add, remove, redirectToSignIn],
  );

  return {
    ...query,
    entries: query.data ?? [],
    savedIds,
    isSaved: (id: string) => savedIds.has(id),
    toggle,
  };
}
