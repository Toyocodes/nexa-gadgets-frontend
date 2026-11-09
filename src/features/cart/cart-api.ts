import { baseApi } from "@/lib/api/base-api";
import type { ApiEnvelope, Cart, MergeCartResponse } from "@/types/api";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<Cart, string>({
      // A user who never added anything gets an empty cart with `_id: null`.
      query: (userId) => `/shop/cart/get/${userId}`,
      transformResponse: (res: ApiEnvelope<Cart>) => res.data,
      providesTags: ["Cart"],
    }),

    addToCart: build.mutation<unknown, { userId: string; productId: string; quantity: number }>({
      query: (body) => ({ url: "/shop/cart/add", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),

    /** Moves a guest's items into the account; useMergeGuestCart writes the result to the cache. */
    mergeCart: build.mutation<
      MergeCartResponse,
      { items: { productId: string; quantity: number }[] }
    >({
      query: (body) => ({ url: "/shop/cart/merge", method: "POST", body }),
    }),

    updateCartQuantity: build.mutation<
      ApiEnvelope<Cart>,
      { userId: string; productId: string; quantity: number }
    >({
      query: (body) => ({ url: "/shop/cart/update-cart", method: "PUT", body }),
      // Optimistic: the stepper responds instantly; we roll back if the API refuses.
      async onQueryStarted({ userId, productId, quantity }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", userId, (cart) => {
            const item = cart.items.find((i) => i.productId === productId);
            if (item) item.quantity = quantity;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    removeFromCart: build.mutation<ApiEnvelope<Cart>, { userId: string; productId: string }>({
      query: ({ userId, productId }) => ({
        url: `/shop/cart/${userId}/${productId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ userId, productId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", userId, (cart) => {
            cart.items = cart.items.filter((i) => i.productId !== productId);
          }),
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

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useMergeCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
} = cartApi;
