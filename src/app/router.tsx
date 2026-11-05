import { createBrowserRouter, Navigate, type RouteObject } from "react-router";
import { RouteErrorBoundary } from "@/components/feedback/route-error";
import { LegacyRedirect } from "@/components/layout/legacy-redirect";
import type { RouteHandle } from "@/components/layout/route-handle";
import { StoreLayout } from "@/components/layout/store-layout";
import { GuestOnly, RequireAdmin, RequireAuth } from "@/features/auth/route-guards";
import { paths } from "./paths";
import { RootLayout } from "./root-layout";

/** Route-level code splitting: each page is its own chunk. */
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
});

const handle = (h: RouteHandle) => h;

const legacyRoutes: RouteObject[] = [
  { path: "/shop", element: <Navigate to="/" replace /> },
  { path: "/shop/home", element: <Navigate to="/" replace /> },
  { path: "/shop/listing", element: <LegacyRedirect to={() => paths.products()} /> },
  { path: "/shop/product/:id", element: <LegacyRedirect to={(p) => paths.product(p.id ?? "")} /> },
  { path: "/shop/checkout", element: <Navigate to={paths.checkout} replace /> },
  { path: "/shop/account", element: <Navigate to={paths.account} replace /> },
  { path: "/shop/faq", element: <Navigate to={paths.help} replace /> },
  { path: "/shop/paystack-return", element: <LegacyRedirect to={() => paths.paymentReturn} /> },
  { path: "/wishlist", element: <Navigate to={paths.wishlist} replace /> },
  { path: "/admin/dashboard", element: <Navigate to={paths.admin} replace /> },
];

const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <StoreLayout />,
        children: [
          {
            index: true,
            handle: handle({ categoryChips: true }),
            lazy: page(() => import("@/features/catalog/pages/home-page")),
          },
          {
            path: "products",
            handle: handle({ categoryChips: true }),
            lazy: page(() => import("@/features/catalog/pages/listing-page")),
          },
          {
            path: "products/:productId",
            handle: handle({ mobileHeader: "back", hideTabBar: true }),
            lazy: page(() => import("@/features/catalog/pages/product-page")),
          },
          {
            path: "search",
            lazy: page(() => import("@/features/catalog/pages/search-page")),
          },
          { path: "help", lazy: page(() => import("@/features/content/pages/faq-page")) },
          {
            path: "help/delivery",
            lazy: page(() => import("@/features/content/pages/delivery-page")),
          },
          {
            path: "help/returns",
            lazy: page(() => import("@/features/content/pages/returns-page")),
          },
          { path: "legal/:doc", lazy: page(() => import("@/features/content/pages/legal-page")) },
          {
            element: <RequireAuth />,
            children: [
              {
                path: "account",
                lazy: page(() => import("@/features/account/components/account-layout")),
                children: [
                  { index: true, lazy: page(() => import("@/features/account/pages/orders-page")) },
                  {
                    path: "orders/:orderId",
                    lazy: page(() => import("@/features/account/pages/order-page")),
                  },
                  {
                    path: "wishlist",
                    lazy: page(() => import("@/features/account/pages/wishlist-page")),
                  },
                  {
                    path: "addresses",
                    lazy: page(() => import("@/features/account/pages/addresses-page")),
                  },
                  {
                    path: "details",
                    lazy: page(() => import("@/features/account/pages/details-page")),
                  },
                ],
              },
            ],
          },
          { path: "*", lazy: page(() => import("@/features/content/pages/not-found-page")) },
        ],
      },

      // Checkout has its own focused layout (no store navigation).
      {
        element: <RequireAuth />,
        children: [
          { path: "checkout", lazy: page(() => import("@/features/checkout/pages/checkout-page")) },
          {
            path: "checkout/payment",
            lazy: page(() => import("@/features/checkout/pages/payment-return-page")),
          },
        ],
      },

      {
        path: "auth",
        children: [
          {
            element: <GuestOnly />,
            children: [
              { path: "login", lazy: page(() => import("@/features/auth/pages/sign-in-page")) },
              {
                path: "forgot-password",
                lazy: page(() => import("@/features/auth/pages/forgot-password-page")),
              },
            ],
          },
          {
            // New accounts are signed in straight away and land on their account.
            element: <GuestOnly fallback={paths.account} />,
            children: [
              { path: "register", lazy: page(() => import("@/features/auth/pages/sign-up-page")) },
            ],
          },
          // Reachable signed-in or not: they come from emails.
          {
            path: "reset-password/:token",
            lazy: page(() => import("@/features/auth/pages/reset-password-page")),
          },
          {
            path: "magic-link/:token",
            lazy: page(() => import("@/features/auth/pages/magic-link-page")),
          },
        ],
      },

      {
        path: "admin",
        element: <RequireAdmin />,
        children: [
          {
            lazy: page(() => import("@/features/admin/components/admin-layout")),
            children: [
              { index: true, lazy: page(() => import("@/features/admin/pages/dashboard-page")) },
              {
                path: "products",
                lazy: page(() => import("@/features/admin/pages/products-page")),
              },
              { path: "orders", lazy: page(() => import("@/features/admin/pages/orders-page")) },
              {
                path: "delivery",
                lazy: page(() => import("@/features/admin/pages/delivery-page")),
              },
            ],
          },
        ],
      },

      ...legacyRoutes,
    ],
  },
];

export const router = createBrowserRouter(routes);
