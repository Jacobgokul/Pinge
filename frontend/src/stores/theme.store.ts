import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

/**
 * Theme state interface
 */
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Theme store with persistence
 * Handles light/dark/system theme preferences
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

/**
 * Get the actual theme based on preference
 * Resolves 'system' to actual light/dark based on OS preference
 */
export function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  const resolved = getResolvedTheme(theme);
  document.documentElement.setAttribute('data-theme', resolved);
}
