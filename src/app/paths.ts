/** Every URL in the app, in one place. */

function withQuery(path: string, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v) params.set(k, v);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const paths = {
  home: "/",
  products: (query?: Record<string, string | undefined>) => withQuery("/products", query),
  product: (id: string) => `/products/${id}`,
  search: (q: string) => withQuery("/products", { q }),
  checkout: "/checkout",
  paymentReturn: "/checkout/payment",

  account: "/account",
  order: (id: string) => `/account/orders/${id}`,
  wishlist: "/account/wishlist",
  addresses: "/account/addresses",
  accountDetails: "/account/details",

  // These two are linked from emails the API sends — keep them stable.
  signIn: (query?: { redirect?: string }) => withQuery("/auth/login", query),
  signUp: (query?: { redirect?: string }) => withQuery("/auth/register", query),
  forgotPassword: "/auth/forgot-password",
  resetPassword: (token: string) => `/auth/reset-password/${token}`,
  magicLink: (token: string) => `/auth/magic-link/${token}`,

  help: "/help",
  delivery: "/help/delivery",
  returns: "/help/returns",
  terms: "/legal/terms",
  privacy: "/legal/privacy",

  admin: "/admin",
  adminProducts: "/admin/products",
  adminOrders: "/admin/orders",
  adminDelivery: "/admin/delivery",
} as const;
