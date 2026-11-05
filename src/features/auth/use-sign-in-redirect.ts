import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { paths } from "@/app/paths";

/** Send the visitor to sign in, remembering the page to come back to. */
export function useSignInRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(
    () => navigate(paths.signIn({ redirect: location.pathname + location.search })),
    [navigate, location.pathname, location.search],
  );
}

/** Only allow same-site relative redirects (no "//evil.com" or "https://…"). */
export function safeRedirect(target: string | null | undefined, fallback = "/") {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return fallback;
  return target;
}
