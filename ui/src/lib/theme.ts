export type Theme = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Stored preference, defaulting to following the OS. Invalid values fall back to system. */
export const getStoredTheme = (): Theme => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    // localStorage can throw in private modes; the app still renders, just without persistence.
    return 'system';
  }
};

export const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

export const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === 'system' ? getSystemTheme() : theme;

/**
 * Apply a theme to the document. The palettes themselves live in index.css as CSS variables
 * scoped to `:root` and `.dark`, so this only moves the class (and `color-scheme`, which tells
 * the browser how to paint native controls, scrollbars and form widgets).
 */
export const applyTheme = (theme: Theme): ResolvedTheme => {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
  return resolved;
};

/** Shared by the React provider and the pre-paint script in index.html so both agree. */
export const prefersDark = (): boolean => {
  try {
    return window.matchMedia(DARK_QUERY).matches;
  } catch {
    return false;
  }
};
