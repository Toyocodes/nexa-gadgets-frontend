import { Heart, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { toast } from "sonner";
import { paths } from "@/app/paths";
import { useAppSelector } from "@/app/store";
import { useLogoutMutation } from "@/features/auth/auth-api";
import { selectUser } from "@/features/auth/auth-slice";
import { cn } from "@/lib/utils";

const NAV = [
  { to: paths.account, label: "Orders", icon: Package, end: true },
  { to: paths.wishlist, label: "Wishlist", icon: Heart },
  { to: paths.addresses, label: "Addresses", icon: MapPin },
  { to: paths.accountDetails, label: "Account details", icon: UserRound },
];

export default function AccountLayout() {
  const user = useAppSelector(selectUser)!;
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const signOut = async () => {
    await logout()
      .unwrap()
      .catch(() => undefined);
    toast("You're signed out");
    navigate(paths.home);
  };

  const item = (active: boolean) =>
    cn(
      "flex h-11 flex-none items-center gap-3 rounded-md px-3 text-[15px] no-underline transition-colors",
      active
        ? "border border-border bg-card font-semibold text-foreground"
        : "text-ink-2 hover:text-foreground",
    );

  return (
    <div className="container-page flex flex-col gap-6 pt-6 pb-20 md:flex-row md:flex-wrap md:items-start md:gap-10 md:pt-10">
      <nav
        aria-label="Account sections"
        className="flex min-w-0 flex-col gap-1 md:max-w-[260px] md:flex-[1_1_220px]"
      >
        <div className="px-3 pb-4 md:px-3">
          <div className="text-[22px] font-semibold tracking-[-0.02em]">Hi, {user.userName}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">{user.email}</div>
        </div>
        <div className="-mx-4 scrollbar-none flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => item(isActive)}>
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={signOut}
            className={cn(
              item(false),
              "md:mt-3 md:rounded-none md:border-t md:border-border md:pt-3",
            )}
          >
            <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </nav>
      <section className="flex min-w-0 flex-col gap-5 md:flex-[999_1_560px]">
        <Outlet />
      </section>
    </div>
  );
}
