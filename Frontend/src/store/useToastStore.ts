import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/**
 * Transient, non-blocking messages. Unlike `notify()` (a modal Alert that
 * interrupts), a toast is for confirmations and soft failures the user
 * shouldn't have to dismiss.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, tone = 'info') =>
    set((s) => {
      // Ignore an identical message that's already on screen — mutation retries
      // and double taps otherwise stack duplicates.
      if (s.toasts.some((t) => t.message === message && t.tone === tone)) {
        return s;
      }
      return { toasts: [...s.toasts, { id: nextId++, message, tone }] };
    }),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Imperative helpers so mutation callbacks can raise a toast without hooks.
 * Pass already-translated text — the store holds no i18n keys.
 */
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
};
