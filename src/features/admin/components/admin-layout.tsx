import { ExternalLink, LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { useLogoutMutation } from "@/features/auth/auth-api";
import { cn } from "@/lib/utils";

const NAV = [
  { to: paths.admin, label: "Dashboard", end: true },
  { to: paths.adminProducts, label: "Products" },
  { to: paths.adminOrders, label: "Orders" },
  { to: paths.adminDelivery, label: "Delivery & pickup" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const signOut = async () => {
    await logout()
      .unwrap()
      .catch(() => undefined);
    navigate(paths.home);
  };

  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex h-11 flex-none items-center rounded-md px-3 text-[15px] no-underline transition-colors",
      isActive ? "bg-night-2 font-semibold text-white" : "text-night-soft hover:text-white",
    );

  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      {/* The dark column runs the full page height; the nav inside stays pinned. */}
      <div className="bg-night md:w-[260px] md:flex-none">
        <nav
          aria-label="Admin"
          className="flex flex-col gap-1 px-4 py-4 text-night-foreground md:sticky md:top-0 md:h-svh md:py-6"
        >
          <div className="flex items-center justify-between px-3 pb-2 md:pb-6">
            <span className="flex items-baseline gap-1.5">
              <Logo inverted className="text-2xl" to={paths.admin} />
              <span className="text-[13px] font-medium text-night-muted">admin</span>
            </span>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="text-night-soft hover:text-white md:hidden"
            >
              <LogOut size={20} strokeWidth={1.8} />
            </button>
          </div>
          <div className="-mx-4 scrollbar-none flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={link}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-auto hidden flex-col gap-1 border-t border-night-2 pt-3 md:flex">
            <div className="px-3 pb-2">
              <ThemeSwitcher night />
            </div>
            <Link
              to={paths.home}
              className="flex h-11 items-center gap-2 rounded-md px-3 text-[15px] text-night-soft no-underline hover:text-white"
            >
              <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" /> View store
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex h-11 items-center gap-2 rounded-md px-3 text-[15px] text-night-soft hover:text-white"
            >
              <LogOut size={16} strokeWidth={1.8} aria-hidden="true" /> Sign out
            </button>
          </div>
        </nav>
      </div>
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:max-w-[1100px] md:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <title>{`${title} — Nexa admin`}</title>
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] md:text-[32px]">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-[560px] text-[15px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
