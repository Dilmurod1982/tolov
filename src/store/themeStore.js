import { create } from 'zustand';

const STORAGE_KEY = 'gaspay-theme';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

const saved = (typeof localStorage !== 'undefined'
  ? localStorage.getItem(STORAGE_KEY)
  : null) || 'light';

applyTheme(saved);

export const useThemeStore = create((set) => ({
  theme: saved,
  setTheme: (theme) => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
  },
  toggle: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      return { theme: next };
    }),
}));