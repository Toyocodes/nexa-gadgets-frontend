import { baseApi } from "@/lib/api/base-api";
import type { WishlistEntry } from "@/types/api";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<WishlistEntry[], string>({
      query: (userId) => `/shop/wishlist/get/${userId}`,
      // Drop entries whose product has since been deleted.
      transformResponse: (res: { data: WishlistEntry[] }) => res.data.filter((e) => e.product),
      providesTags: ["Wishlist"],
    }),

    addToWishlist: build.mutation<unknown, { userId: string; productId: string }>({
      query: (body) => ({ url: "/shop/wishlist/add", method: "POST", body }),
      invalidatesTags: ["Wishlist"],
    }),

    removeFromWishlist: build.mutation<unknown, { userId: string; productId: string }>({
      query: ({ userId, productId }) => ({
        url: `/shop/wishlist/delete/${userId}/${productId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ userId, productId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData("getWishlist", userId, (list) =>
            list.filter((e) => e.product?._id !== productId),
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } =
  wishlistApi;
