import { Link } from "react-router";
import { paths } from "@/app/paths";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center gap-6 py-24 text-center">
      <title>Page not found — Nexa Gadgets</title>
      <span className="font-mono text-6xl font-semibold text-subtle">404</span>
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">We couldn't find that page</h1>
        <p className="mt-2 text-muted-foreground">
          It may have moved, or the link might be mistyped.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to={paths.products()}>Browse products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={paths.home}>Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
