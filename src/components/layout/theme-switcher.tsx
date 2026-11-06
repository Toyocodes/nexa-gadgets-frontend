import { Monitor, Moon, Sun } from "lucide-react";
import { setThemeChoice, useThemeChoice, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "Match device theme", icon: Monitor },
];

/** Light, dark, or follow the device. `night` is for dark panels like the admin sidebar. */
export function ThemeSwitcher({ night = false }: { night?: boolean }) {
  const current = useThemeChoice();
  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex w-fit gap-0.5 rounded-full border p-0.5",
        night ? "border-night-2" : "border-border",
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={() => setThemeChoice(value)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors",
              night
                ? active
                  ? "bg-night-2 text-white"
                  : "text-night-soft hover:text-white"
                : active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
