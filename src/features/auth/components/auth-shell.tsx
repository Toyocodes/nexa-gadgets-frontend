import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  /** Left brand panel: light (sign in) or dark (create account). */
  tone?: "light" | "dark";
  image: string;
  imageAlt: string;
  imageWidth?: number;
  panel: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Split layout for sign-in screens: brand panel on the left (desktop only),
 * form on the right. The back link points left, toward the store.
 */
export function AuthShell({
  tone = "light",
  image,
  imageAlt,
  imageWidth = 420,
  panel,
  children,
}: AuthShellProps) {
  const dark = tone === "dark";
  return (
    <div className="flex min-h-svh bg-card text-foreground">
      <aside
        className={cn(
          "hidden min-h-[360px] flex-[1_1_520px] flex-col justify-between gap-8 px-14 py-10 lg:flex",
          dark ? "bg-night text-white" : "bg-tile",
        )}
      >
        <Logo inverted={dark} />
        <img
          src={image}
          alt={imageAlt}
          className="h-auto w-full self-center"
          style={{ maxWidth: imageWidth }}
        />
        <div className="flex flex-col gap-4">{panel}</div>
      </aside>

      <main className="flex flex-[1_1_520px] flex-col px-5 py-2 md:px-6 md:py-10">
        {/* Mobile header: back arrow · logo */}
        <div className="flex items-center justify-between md:hidden">
          <Link
            to={paths.home}
            aria-label="Back to store"
            className="flex size-11 items-center justify-center text-foreground"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </Link>
          <Logo className="text-[22px]" to={null} />
          <span className="w-11" />
        </div>
        <Link
          to={paths.home}
          className="ml-4 hidden h-11 items-center gap-1.5 self-start text-sm text-ink-2 no-underline hover:text-foreground md:inline-flex"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back to store
        </Link>
        <div className="flex flex-1 justify-center pt-4 md:items-center md:pt-0">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-[30px] font-semibold tracking-[-0.04em] md:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 text-[15px] text-muted-foreground md:mt-2 md:text-base">{subtitle}</p>
      )}
    </div>
  );
}
