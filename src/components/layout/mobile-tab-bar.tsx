import { Heart, House, LayoutGrid, UserRound, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router";
import { paths } from "@/app/paths";
import { useAppSelector } from "@/app/store";
import { selectUser } from "@/features/auth/auth-slice";
import { cn } from "@/lib/utils";

/** Bottom tab bar for phones — most of the store's traffic. */
export function MobileTabBar() {
  const user = useAppSelector(selectUser);
  const tabs: {
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
    strokeWidth: number;
  }[] = [
    { to: paths.home, label: "Home", icon: House, end: true, strokeWidth: 2 },
    { to: paths.products(), label: "Shop", icon: LayoutGrid, strokeWidth: 1.8 },
    { to: paths.wishlist, label: "Wishlist", icon: Heart, strokeWidth: 1.8 },
    {
      to: user ? paths.account : paths.signUp(),
      label: "Account",
      icon: UserRound,
      end: true,
      strokeWidth: 1.8,
    },
  ];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card px-2 pt-1.5 pb-[max(20px,env(safe-area-inset-bottom))] md:hidden"
    >
      {tabs.map(({ to, label, icon: Icon, end, strokeWidth }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex h-[52px] flex-col items-center justify-center gap-1 text-[11px] no-underline",
              isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
            )
          }
        >
          <Icon size={22} strokeWidth={strokeWidth} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
