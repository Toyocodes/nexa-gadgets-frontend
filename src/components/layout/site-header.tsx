import { ArrowLeft, Heart, LayoutDashboard, ShoppingBag, UserRound } from "lucide-react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router";
import { paths } from "@/app/paths";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { Logo } from "@/components/brand/logo";
import { AUDIO_CATEGORIES, CATEGORIES } from "@/config/catalog";
import { selectUser } from "@/features/auth/auth-slice";
import { cartOpened } from "@/features/cart/cart-ui-slice";
import { useCart } from "@/features/cart/use-cart";
import { cn } from "@/lib/utils";
import { useMobileTitleValue } from "./mobile-title-context";
import type { RouteHandle } from "./route-handle";
import { SearchBox } from "./search-box";

export function UtilityBar() {
  return (
    <div className="hidden bg-night text-[13px] text-night-foreground md:block">
      <div className="container-page flex flex-wrap justify-center gap-x-7 gap-y-1.5 py-2.5">
        <span>Lagos delivery or store pickup</span>
        <span>Manufacturer warranty</span>
        <span>7-day returns</span>
        <span>Pay securely by bank transfer</span>
      </div>
    </div>
  );
}

function CartButton() {
  const dispatch = useAppDispatch();
  const { count } = useCart();
  return (
    <button
      type="button"
      onClick={() => dispatch(cartOpened())}
      className="flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-white transition-colors hover:bg-foreground/85"
    >
      <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />
      Cart · {count}
    </button>
  );
}

function MobileCartButton() {
  const dispatch = useAppDispatch();
  const { count } = useCart();
  return (
    <button
      type="button"
      onClick={() => dispatch(cartOpened())}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative flex size-11 items-center justify-center text-foreground"
    >
      <ShoppingBag size={22} strokeWidth={1.8} aria-hidden="true" />
      {count > 0 && (
        <span className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function AccountLinks() {
  const user = useAppSelector(selectUser);
  const navLink =
    "flex h-11 items-center gap-2 px-3 text-sm font-medium text-foreground hover:text-primary";
  return (
    <nav aria-label="Account" className="flex items-center gap-1">
      <Link to={paths.help} className={navLink}>
        Help
      </Link>
      <Link
        to={paths.wishlist}
        aria-label="Wishlist"
        className="flex size-11 items-center justify-center rounded-full text-foreground hover:bg-muted"
      >
        <Heart size={20} strokeWidth={1.8} />
      </Link>
      {user?.role === "admin" && (
        <Link to={paths.admin} className={navLink}>
          <LayoutDashboard size={20} strokeWidth={1.8} aria-hidden="true" />
          Admin
        </Link>
      )}
      {user ? (
        <Link to={paths.account} className={navLink}>
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary uppercase">
            {user.userName.charAt(0)}
          </span>
          Account
        </Link>
      ) : (
        <Link to={paths.signIn()} className={navLink}>
          <UserRound size={20} strokeWidth={1.8} aria-hidden="true" />
          Sign in
        </Link>
      )}
      <CartButton />
    </nav>
  );
}

/** Which category link matches the current listing filters. */
function useActiveCategory() {
  const [params] = useSearchParams();
  if (params.get("onSale")) return "deals";
  return params.get("category") ?? "";
}

function CategoryNav() {
  const active = useActiveCategory();
  const link = (isActive: boolean) =>
    cn("py-1.5 no-underline hover:text-foreground", isActive ? "text-foreground" : "text-ink-2");
  return (
    <nav
      aria-label="Categories"
      className="container-page flex flex-wrap gap-x-7 gap-y-1 pb-3 text-sm font-medium"
    >
      {CATEGORIES.map((c) => (
        <Link key={c.id} to={paths.products({ category: c.id })} className={link(active === c.id)}>
          {c.label}
        </Link>
      ))}
      <Link
        to={paths.products({ onSale: "1" })}
        className="py-1.5 text-primary hover:text-primary-hover"
      >
        Deals
      </Link>
    </nav>
  );
}

const MOBILE_CHIPS = [
  { label: "All", to: paths.products(), match: "" },
  { label: "Phones", to: paths.products({ category: "phones" }), match: "phones" },
  { label: "Laptops", to: paths.products({ category: "laptop" }), match: "laptop" },
  {
    label: "Audio",
    to: paths.products({ category: AUDIO_CATEGORIES.join(",") }),
    match: AUDIO_CATEGORIES.join(","),
  },
  { label: "Power banks", to: paths.products({ category: "powerbanks" }), match: "powerbanks" },
  { label: "Smartwatches", to: paths.products({ category: "smartwatch" }), match: "smartwatch" },
  { label: "Deals", to: paths.products({ onSale: "1" }), match: "deals" },
];

export function MobileCategoryChips() {
  const active = useActiveCategory();
  return (
    <nav
      aria-label="Categories"
      className="scrollbar-none flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-3 md:hidden"
    >
      {MOBILE_CHIPS.map((chip) => {
        const on = chip.match === active;
        return (
          <NavLink
            key={chip.label}
            to={chip.to}
            className={cn(
              "flex h-9 flex-none items-center rounded-full px-3.5 text-sm font-medium no-underline",
              on ? "bg-foreground text-white" : "border border-input text-foreground",
            )}
          >
            {chip.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function SiteHeader({ handle }: { handle: RouteHandle }) {
  const navigate = useNavigate();
  const mobileTitle = useMobileTitleValue();

  return (
    <>
      {/* Desktop */}
      <header className="hidden border-b border-border bg-card md:block">
        <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 pb-3">
          <Logo />
          <SearchBox shortcut className="flex-[1_1_360px]" />
          <AccountLinks />
        </div>
        <CategoryNav />
      </header>

      {/* Mobile */}
      {handle.mobileHeader === "back" ? (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card p-2 md:hidden">
          <button
            type="button"
            aria-label="Back"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(paths.home))}
            className="flex size-11 items-center justify-center text-foreground"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <span className="text-[15px] font-semibold">{mobileTitle || handle.mobileTitle}</span>
          <MobileCartButton />
        </header>
      ) : (
        <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Logo className="text-2xl" />
            <MobileCartButton />
          </div>
          <SearchBox placeholder="Search gadgets" />
        </header>
      )}
      {handle.categoryChips && <MobileCategoryChips />}
    </>
  );
}
