import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { sessionExpired } from "@/features/auth/auth-slice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  // The session is an httpOnly cookie; the browser attaches it, we never read it.
  credentials: "include",
});

// Endpoints where a 401 is an expected answer, not an expired session.
const AUTH_PROBES = ["/auth/check-auth", "/auth/login", "/auth/change-password", "/auth/me"];

/**
 * Wraps fetchBaseQuery so every request shares one policy:
 * - 401 on a protected endpoint → the session is gone; clear the user so the
 *   route guards send them to sign in (and remember where they were).
 * - Every error keeps the server's `{ message }`, which is written for users.
 */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status === 401 && !AUTH_PROBES.some((p) => url.startsWith(p))) {
    api.dispatch(sessionExpired());
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Session",
    "Profile",
    "Product",
    "ProductList",
    "Reviews",
    "Cart",
    "Wishlist",
    "Address",
    "Delivery",
    "Order",
    "AdminProduct",
    "AdminOrder",
    "AdminDelivery",
    "Analytics",
  ],
  endpoints: () => ({}),
});
