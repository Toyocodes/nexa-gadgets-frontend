import { Navigate, useLocation, useParams } from "react-router";

/** Old /shop/* URLs (bookmarks, shared links) keep working. */
export function LegacyRedirect({
  to,
}: {
  to: (params: Record<string, string | undefined>) => string;
}) {
  const params = useParams();
  const { search } = useLocation();
  return <Navigate to={to(params) + search} replace />;
}
