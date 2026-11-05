import { Outlet } from "react-router";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { MobileTabBar } from "./mobile-tab-bar";
import { MobileTitleProvider } from "./mobile-title";
import { useRouteHandle } from "./route-handle";
import { SiteFooter } from "./site-footer";
import { SiteHeader, UtilityBar } from "./site-header";

/** Shell for every storefront page: utility bar, header, footer, cart drawer. */
export function StoreLayout() {
  const handle = useRouteHandle();
  return (
    // Bottom padding keeps content clear of the fixed mobile tab bar / buy bar.
    <MobileTitleProvider>
      <div className="flex min-h-svh flex-col pb-[92px] md:pb-0">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-card px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <UtilityBar />
        <SiteHeader handle={handle} />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        {!handle.hideTabBar && <MobileTabBar />}
        <CartDrawer />
      </div>
    </MobileTitleProvider>
  );
}
