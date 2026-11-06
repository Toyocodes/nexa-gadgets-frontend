import { useSyncExternalStore } from "react";

export type ThemeChoice = "system" | "light" | "dark";

/** Also read by the inline script in index.html, which applies the theme before first paint. */
const STORAGE_KEY = "nexa:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
// Matches --background in globals.css, for the browser's toolbar on phones.
const THEME_COLORS = { light: "#f6f6f3", dark: "#0f1013" };

export function parseThemeChoice(raw: string | null): ThemeChoice {
  return raw === "light" || raw === "dark" ? raw : "system";
}

export function resolveTheme(choice: ThemeChoice, systemPrefersDark: boolean) {
  if (choice === "system") return systemPrefersDark ? "dark" : "light";
  return choice;
}

function readChoice(): ThemeChoice {
  try {
    return parseThemeChoice(localStorage.getItem(STORAGE_KEY));
  } catch {
    return "system";
  }
}

let choice = readChoice();
const listeners = new Set<() => void>();
const media = window.matchMedia(DARK_QUERY);

function apply() {
  const theme = resolveTheme(choice, media.matches);
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  listeners.forEach((listener) => listener());
}

media.addEventListener("change", apply);
window.addEventListener("storage", (e) => {
  if (e.key !== STORAGE_KEY) return;
  choice = parseThemeChoice(e.newValue);
  apply();
});

export function setThemeChoice(next: ThemeChoice) {
  choice = next;
  try {
    if (next === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage blocked: the choice lasts until the page reloads */
  }
  apply();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useThemeChoice = () => useSyncExternalStore(subscribe, () => choice);

/** The theme actually showing, after working out "system". */
export const useResolvedTheme = () =>
  useSyncExternalStore(subscribe, () => resolveTheme(choice, media.matches));
