import { baseApi, notFoundAs } from "@/lib/api/base-api";
import type {
  Address,
  AddressInput,
  ApiEnvelope,
  CreateOrderResponse,
  DeliveryOption,
  Order,
} from "@/types/api";

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Pickup and delivery choices. Fees are set by the admin — never hard-code them. */
    getDeliveryOptions: build.query<DeliveryOption[], void>({
      query: () => "/shop/delivery-options",
      transformResponse: (res: ApiEnvelope<DeliveryOption[]>) => res.data,
      providesTags: ["Delivery"],
    }),

    getAddresses: build.query<Address[], string>({
      query: (userId) => `/shop/address/get/${userId}`,
      transformResponse: (res: ApiEnvelope<Address[]>) => res.data,
      providesTags: ["Address"],
    }),

    addAddress: build.mutation<ApiEnvelope<Address>, AddressInput>({
      query: (body) => ({ url: "/shop/address/add", method: "POST", body }),
      invalidatesTags: ["Address"],
    }),

    updateAddress: build.mutation<
      ApiEnvelope<Address>,
      { userId: string; addressId: string; body: Partial<AddressInput> }
    >({
      query: ({ userId, addressId, body }) => ({
        url: `/shop/address/update/${userId}/${addressId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Address"],
    }),

    deleteAddress: build.mutation<unknown, { userId: string; addressId: string }>({
      query: ({ userId, addressId }) => ({
        url: `/shop/address/delete/${userId}/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),

    /**
     * The server builds the order from the user's own cart; we only send the
     * delivery choice (and address for delivery). Use the returned totalAmount
     * for Paystack — never a total worked out in the browser.
     */
    createOrder: build.mutation<
      CreateOrderResponse,
      { deliveryOptionId: string; addressId?: string; notes?: string }
    >({
      query: ({ deliveryOptionId, addressId, notes }) => ({
        url: "/shop/order/create",
        method: "POST",
        body: { deliveryOptionId, addressInfo: addressId ? { addressId } : undefined, notes },
      }),
      invalidatesTags: ["Order"],
    }),

    verifyPayment: build.mutation<ApiEnvelope<Order>, { reference: string; orderId: string }>({
      query: (body) => ({ url: "/shop/order/verify", method: "PUT", body }),
      invalidatesTags: ["Order", "Cart", "ProductList"],
    }),

    getOrders: build.query<Order[], string>({
      // No orders yet comes back as 404.
      queryFn: (userId, _api, _opts, baseQuery) =>
        notFoundAs(baseQuery(`/shop/order/list/${userId}`), [], (b) =>
          [...(b as ApiEnvelope<Order[]>).data].sort(
            (a, z) => +new Date(z.orderDate) - +new Date(a.orderDate),
          ),
        ),
      providesTags: ["Order"],
    }),

    getOrder: build.query<Order, string>({
      query: (id) => `/shop/order/details/${id}`,
      transformResponse: (res: ApiEnvelope<Order>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
  }),
});

export const {
  useGetDeliveryOptionsQuery,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useLazyGetOrderQuery,
} = checkoutApi;
