import { baseApi, notFoundAs } from "@/lib/api/base-api";
import type {
  Analytics,
  ApiEnvelope,
  DeliveryOption,
  DeliveryOptionInput,
  Order,
  OrderStatus,
  Product,
  ProductInput,
} from "@/types/api";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAnalytics: build.query<Analytics, void>({
      query: () => "/admin/analytics/get",
      providesTags: ["Analytics"],
    }),

    getAdminProducts: build.query<Product[], void>({
      query: () => "/admin/products/get",
      transformResponse: (res: ApiEnvelope<Product[]>) => res.data,
      providesTags: ["AdminProduct"],
    }),

    uploadProductImage: build.mutation<string, File>({
      query: (file) => {
        const body = new FormData();
        body.append("my_file", file);
        return {
          url: "/admin/products/upload-image",
          method: "POST",
          body,
          // A failed upload still answers 200, with `success: false`.
          validateStatus: (res, json: { success?: boolean }) => res.ok && json?.success !== false,
        };
      },
      transformResponse: (res: { result: { secure_url: string } }) => res.result.secure_url,
    }),

    addProduct: build.mutation<ApiEnvelope<Product>, ProductInput>({
      query: (body) => ({ url: "/admin/products/add", method: "POST", body }),
      invalidatesTags: ["AdminProduct", "ProductList", "Analytics"],
    }),

    editProduct: build.mutation<ApiEnvelope<Product>, { id: string; body: ProductInput }>({
      query: ({ id, body }) => ({ url: `/admin/products/edit/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => ["AdminProduct", "ProductList", { type: "Product", id }],
    }),

    deleteProduct: build.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/products/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminProduct", "ProductList", "Analytics"],
    }),

    getAdminOrders: build.query<Order[], void>({
      queryFn: (_arg, _api, _opts, baseQuery) =>
        notFoundAs(baseQuery("/admin/orders/get"), [], (b) =>
          [...(b as ApiEnvelope<Order[]>).data].sort(
            (a, z) => +new Date(z.orderDate) - +new Date(a.orderDate),
          ),
        ),
      providesTags: ["AdminOrder"],
    }),

    updateOrderStatus: build.mutation<unknown, { id: string; orderStatus: OrderStatus }>({
      query: ({ id, orderStatus }) => ({
        url: `/admin/orders/update/${id}`,
        method: "PUT",
        body: { orderStatus },
      }),
      invalidatesTags: ["AdminOrder", "Analytics"],
    }),

    getAdminDeliveryOptions: build.query<DeliveryOption[], void>({
      query: () => "/admin/delivery-options",
      transformResponse: (res: ApiEnvelope<DeliveryOption[]>) => res.data,
      providesTags: ["AdminDelivery"],
    }),

    createDeliveryOption: build.mutation<ApiEnvelope<DeliveryOption>, DeliveryOptionInput>({
      query: (body) => ({ url: "/admin/delivery-options", method: "POST", body }),
      invalidatesTags: ["AdminDelivery", "Delivery"],
    }),

    updateDeliveryOption: build.mutation<
      ApiEnvelope<DeliveryOption>,
      { id: string; body: Partial<DeliveryOptionInput> }
    >({
      query: ({ id, body }) => ({ url: `/admin/delivery-options/${id}`, method: "PUT", body }),
      invalidatesTags: ["AdminDelivery", "Delivery"],
    }),

    deleteDeliveryOption: build.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/delivery-options/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminDelivery", "Delivery"],
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetAdminProductsQuery,
  useUploadProductImageMutation,
  useAddProductMutation,
  useEditProductMutation,
  useDeleteProductMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAdminDeliveryOptionsQuery,
  useCreateDeliveryOptionMutation,
  useUpdateDeliveryOptionMutation,
  useDeleteDeliveryOptionMutation,
} = adminApi;
