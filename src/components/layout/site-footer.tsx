import { Link } from "react-router";
import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/logo";
import { AUDIO_CATEGORIES } from "@/config/catalog";
import { ThemeSwitcher } from "./theme-switcher";

const columns = [
  {
    title: "Shop",
    label: "Shop",
    links: [
      { to: paths.products({ category: "phones" }), label: "Phones" },
      { to: paths.products({ category: "laptop" }), label: "Laptops" },
      { to: paths.products({ category: AUDIO_CATEGORIES.join(",") }), label: "Audio" },
      { to: paths.products({ onSale: "1" }), label: "Deals" },
    ],
  },
  {
    title: "Help",
    label: "Help",
    links: [
      { to: paths.help, label: "FAQs" },
      { to: paths.delivery, label: "Delivery" },
      { to: paths.returns, label: "Returns" },
      { to: paths.account, label: "Track an order" },
    ],
  },
  {
    title: "Account",
    label: "Account links",
    links: [
      { to: paths.signIn(), label: "Sign in" },
      { to: paths.signUp(), label: "Create account" },
      { to: paths.account, label: "My orders" },
      { to: paths.wishlist, label: "Wishlist" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container-page flex flex-wrap gap-x-16 gap-y-10 pt-12 pb-8">
        <div className="flex-[1_1_260px]">
          <Logo to={null} />
          <p className="mt-3 max-w-[280px] text-sm leading-[1.6] text-muted-foreground">
            Genuine phones, laptops and accessories, delivered across Lagos.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.label} className="flex flex-col gap-2.5 text-sm">
            <span className="font-semibold">{col.title}</span>
            {col.links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-ink-2 no-underline hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 pb-8 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-4">
          © {new Date().getFullYear()} Nexa Gadgets
          <ThemeSwitcher />
        </span>
        <span className="flex gap-4">
          <Link to={paths.terms} className="text-muted-foreground hover:text-foreground">
            Terms
          </Link>
          <Link to={paths.privacy} className="text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
          <span>Payments secured by Paystack</span>
        </span>
      </div>
    </footer>
  );
}
