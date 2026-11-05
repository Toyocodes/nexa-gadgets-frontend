import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { paths } from "@/app/paths";
import { useAppDispatch } from "@/app/store";
import { Logo } from "@/components/brand/logo";
import { cartOpened } from "@/features/cart/cart-ui-slice";
import { cn } from "@/lib/utils";

/** Focused checkout header — no store navigation to pull people away. */
export function CheckoutHeader({ title = "Checkout" }: { title?: string }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const backToCart = () => {
    navigate(paths.home);
    dispatch(cartOpened());
  };
  return (
    <>
      <header className="hidden border-b border-border bg-card md:block">
        <div className="mx-auto flex max-w-(--container-checkout) flex-wrap items-center justify-between gap-3 px-10 py-[18px]">
          <Logo />
          <span className="flex items-center gap-2 text-sm font-medium text-ink-2">
            <Lock size={16} strokeWidth={2} aria-hidden="true" />
            Secure checkout
          </span>
        </div>
      </header>
      <header className="flex items-center justify-between border-b border-border bg-card p-2 md:hidden">
        <button
          type="button"
          aria-label="Back to cart"
          onClick={backToCart}
          className="flex size-11 items-center justify-center text-foreground"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <span className="text-base font-semibold">{title}</span>
        <span
          role="img"
          aria-label="Secure checkout"
          className="flex size-11 items-center justify-center text-success"
        >
          <ShieldCheck size={22} strokeWidth={1.8} />
        </span>
      </header>
    </>
  );
}

export function BackToCart() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return (
    <Link
      to={paths.home}
      onClick={(e) => {
        e.preventDefault();
        navigate(-1);
        dispatch(cartOpened());
      }}
      className="hidden h-11 items-center gap-1.5 text-sm text-ink-2 no-underline hover:text-foreground md:inline-flex"
    >
      <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
      Back to cart
    </Link>
  );
}

const STEPS = ["Delivery", "Payment", "Confirmation"];

/** 1 Delivery · 2 Payment · 3 Confirmation (bars on mobile, numbered on desktop). */
export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <>
      <ol
        aria-label="Checkout steps"
        className="mb-8 hidden list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm md:flex"
      >
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "flex items-center gap-2",
              i <= current ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs",
                i <= current ? "bg-foreground text-white" : "border border-input",
              )}
            >
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <ol
        aria-label="Checkout steps"
        className="m-0 grid list-none grid-cols-3 gap-1.5 p-0 md:hidden"
      >
        {["Delivery", "Payment", "Done"].map((label, i) => (
          <li
            key={label}
            aria-current={i === current ? "step" : undefined}
            className="flex flex-col gap-2"
          >
            <span
              className={cn("h-1 rounded-full", i <= current ? "bg-foreground" : "bg-border")}
            />
            <span
              className={cn("text-xs", i <= current ? "font-semibold" : "text-muted-foreground")}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
