export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'ad-automation-theme';

export const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === 'dark' || value === 'light' ? value : null;
};

export const getInitialTheme = (): ThemeMode => {
  const stored = getStoredTheme();
  if (stored) return stored;

  // O produto deve abrir sempre no modo claro institucional; o alto contraste
  // é uma escolha explícita de acessibilidade pelo switch da interface.
  return 'light';
};

export const persistTheme = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, theme);
};

export const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};
