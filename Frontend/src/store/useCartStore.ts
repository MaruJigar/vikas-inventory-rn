import { create } from 'zustand';

import type { Product } from '@/types/product';
import type { CartLine } from '@/features/products/pricing';

interface CartState {
  /** Keyed by product id for O(1) qty lookups. */
  items: Record<string, CartLine>;

  add: (product: Product) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Quantity of a product currently in the cart (0 if absent). */
  qtyOf: (productId: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: {},

  add: (product) =>
    set((state) => {
      const existing = state.items[product.id];
      return {
        items: {
          ...state.items,
          [product.id]: {
            product,
            qty: existing ? existing.qty + 1 : 1,
          },
        },
      };
    }),

  increment: (productId) =>
    set((state) => {
      const line = state.items[productId];
      if (!line) return state;
      return {
        items: {
          ...state.items,
          [productId]: { ...line, qty: line.qty + 1 },
        },
      };
    }),

  decrement: (productId) =>
    set((state) => {
      const line = state.items[productId];
      if (!line) return state;
      if (line.qty <= 1) {
        const next = { ...state.items };
        delete next[productId];
        return { items: next };
      }
      return {
        items: {
          ...state.items,
          [productId]: { ...line, qty: line.qty - 1 },
        },
      };
    }),

  remove: (productId) =>
    set((state) => {
      const next = { ...state.items };
      delete next[productId];
      return { items: next };
    }),

  clear: () => set({ items: {} }),

  qtyOf: (productId) => get().items[productId]?.qty ?? 0,
}));
