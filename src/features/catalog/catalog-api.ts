import { baseApi } from "@/lib/api/base-api";
import type { ApiEnvelope, Product, ProductPage, ProductQuery, Review } from "@/types/api";

/** Serialise filters the way GET /shop/products/get expects them. */
export function toProductSearchParams(q: ProductQuery) {
  const params = new URLSearchParams();
  if (q.category?.length) params.set("category", q.category.join(","));
  if (q.brand?.length) params.set("brand", q.brand.join(","));
  if (q.minPrice != null) params.set("minPrice", String(q.minPrice));
  if (q.maxPrice != null) params.set("maxPrice", String(q.maxPrice));
  if (q.inStock) params.set("inStock", "true");
  if (q.onSale) params.set("onSale", "true");
  if (q.sortBy) params.set("sortBy", q.sortBy);
  if (q.page != null) params.set("page", String(q.page));
  if (q.limit != null) params.set("limit", String(q.limit));
  return params.toString();
}

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** One fixed page, e.g. the home "Trending now" rail or "You might also like". */
    getProducts: build.query<ProductPage, ProductQuery>({
      query: (q) => `/shop/products/get?${toProductSearchParams(q)}`,
      providesTags: ["ProductList"],
    }),

    /** The listing grid: page 1, then "Load more" appends the next page. */
    browseProducts: build.infiniteQuery<ProductPage, Omit<ProductQuery, "page">, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (last) =>
          last.pagination?.hasMore ? last.pagination.page + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) =>
        `/shop/products/get?${toProductSearchParams({ ...queryArg, page: pageParam })}`,
      providesTags: ["ProductList"],
    }),

    getProduct: build.query<Product, string>({
      query: (id) => `/shop/products/get/${id}`,
      transformResponse: (res: ApiEnvelope<Product>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    searchProducts: build.query<Product[], string>({
      query: (keyword) => `/shop/search/${encodeURIComponent(keyword)}`,
      transformResponse: (res: ApiEnvelope<Product[]>) => res.data,
      providesTags: ["ProductList"],
    }),

    getReviews: build.query<Review[], string>({
      query: (productId) => `/shop/review/${productId}`,
      transformResponse: (res: ApiEnvelope<Review[]>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Reviews", id }],
    }),

    addReview: build.mutation<
      ApiEnvelope<Review>,
      { productId: string; reviewValue: number; reviewMessage: string }
    >({
      query: (body) => ({ url: "/shop/review/add", method: "POST", body }),
      // Refetch the product for its new averageReview / numReviews.
      invalidatesTags: (_r, _e, { productId }) => [
        { type: "Reviews", id: productId },
        { type: "Product", id: productId },
        "ProductList",
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useBrowseProductsInfiniteQuery,
  useGetProductQuery,
  useSearchProductsQuery,
  useGetReviewsQuery,
  useAddReviewMutation,
} = catalogApi;
