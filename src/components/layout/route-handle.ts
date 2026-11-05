import { useMatches } from "react-router";

/**
 * Per-route layout options, set via a route's `handle`. The deepest route
 * that sets a key wins.
 */
export interface RouteHandle {
  /** Mobile header: the full store header, or a slim bar with a back arrow and title. */
  mobileHeader?: "store" | "back";
  /** Title in the slim mobile header. */
  mobileTitle?: string;
  /** Show the scrolling category chips under the mobile header. */
  categoryChips?: boolean;
  /** Hide the bottom tab bar (pages with their own fixed bar, like product and checkout). */
  hideTabBar?: boolean;
}

export function useRouteHandle(): RouteHandle {
  const matches = useMatches();
  return matches.reduce<RouteHandle>(
    (acc, m) => ({ ...acc, ...((m.handle as RouteHandle) ?? {}) }),
    {},
  );
}
