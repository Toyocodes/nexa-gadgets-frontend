import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * Last-resort boundary. A failed lazy chunk after a deploy is the usual
 * cause, so the primary action is a reload.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (import.meta.env.DEV) console.error(error);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          {notFound ? "Page not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {notFound
            ? "That page doesn't exist or has moved."
            : "Please reload the page. If it keeps happening, try again in a few minutes."}
        </p>
      </div>
      <div className="flex gap-3">
        {!notFound && <Button onClick={() => window.location.reload()}>Reload</Button>}
        <Button asChild variant="outline">
          <Link to="/">Back to store</Link>
        </Button>
      </div>
    </div>
  );
}
