import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark"; // Actual theme after resolving 'system'
  setTheme: (theme: Theme) => void;
}

// Helper to get system preference
const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Helper to apply theme to DOM
const applyTheme = (theme: "light" | "dark") => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark", // Default to dark mode for dashboard
      resolvedTheme: "dark",

      setTheme: (theme) => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
      },
    }),
    {
      name: "upper-theme",
      onRehydrateStorage: () => (state) => {
        // Apply theme on initial load
        if (state) {
          const resolved =
            state.theme === "system" ? getSystemTheme() : state.theme;
          applyTheme(resolved);
          state.resolvedTheme = resolved;
        }
      },
    },
  ),
);

// Initialize theme on first load (client-side only)
if (typeof window !== "undefined") {
  // Listen for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (e) => {
    const store = useThemeStore.getState();
    if (store.theme === "system") {
      const newTheme = e.matches ? "dark" : "light";
      applyTheme(newTheme);
      useThemeStore.setState({ resolvedTheme: newTheme });
    }
  });

  // Apply initial theme
  const initialState = useThemeStore.getState();
  const resolved =
    initialState.theme === "system" ? getSystemTheme() : initialState.theme;
  applyTheme(resolved);
}

// Selector hooks
export const useTheme = () => useThemeStore((s) => s.theme);
export const useResolvedTheme = () => useThemeStore((s) => s.resolvedTheme);
