import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { paths } from "@/app/paths";
import { useAppSelector } from "@/app/store";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { selectAuthStatus, selectUser } from "./auth-slice";
import { safeRedirect } from "./use-sign-in-redirect";

/** Signed-in customers (and admins) only. Guests go to sign in and come back after. */
export function RequireAuth() {
  const status = useAppSelector(selectAuthStatus);
  const location = useLocation();
  if (status === "checking") return <PageSpinner />;
  if (status === "guest") {
    return (
      <Navigate to={paths.signIn({ redirect: location.pathname + location.search })} replace />
    );
  }
  return <Outlet />;
}

/** Admin area. Customers who wander in are sent back to the store. */
export function RequireAdmin() {
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectUser);
  const location = useLocation();
  if (status === "checking") return <PageSpinner />;
  if (!user) return <Navigate to={paths.signIn({ redirect: location.pathname })} replace />;
  if (user.role !== "admin") return <Navigate to={paths.home} replace />;
  return <Outlet />;
}

/**
 * Sign-in / sign-up pages: once signed in (including the moment a login or
 * registration succeeds) visitors go back where they came from, or to
 * `fallback`. Admins land on the dashboard.
 */
export function GuestOnly({ fallback = paths.home }: { fallback?: string }) {
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectUser);
  const [params] = useSearchParams();
  if (status === "authenticated" && user) {
    const home = user.role === "admin" ? paths.admin : fallback;
    return <Navigate to={safeRedirect(params.get("redirect"), home)} replace />;
  }
  return <Outlet />;
}
