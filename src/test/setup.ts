import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia; src/lib/theme.ts reads it on import.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }) as unknown as MediaQueryList;
