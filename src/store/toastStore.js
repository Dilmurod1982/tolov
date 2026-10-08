import { create } from 'zustand';

let nextId = 1;

export const useToastStore = create((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    const finalToast = {
      id,
      type: 'info',
      duration: 3000,
      ...toast,
    };
    set((s) => ({ toasts: [...s.toasts, finalToast] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, finalToast.duration);
    return id;
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message, type = 'info', duration = 3000) {
  return useToastStore.getState().push({ message, type, duration });
}