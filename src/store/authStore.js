import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  station: null,       // ← добавили
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setStation: (station) => set({ station }),   // ← добавили
  setLoading: (loading) => set({ loading }),

  reset: () => set({ user: null, profile: null, station: null, loading: false }),
}));