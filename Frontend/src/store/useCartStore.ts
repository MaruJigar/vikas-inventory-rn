import { create } from 'zustand';

import type { Product } from '@/types/product';
import type { CartLine } from '@/features/products/pricing';

interface CartState {
  /** Keyed by product id for O(1) qty lookups. */
  items: Record<string, CartLine>;
  /** Order-level discount percentages applied to the whole cart (backend
   * standard/special discount). Applied sequentially at placement. */
  standardDiscountPercent: number;
  specialDiscountPercent: number;
  /** Optional free-text transport mode for the order. */
  transportMode: string;

  add: (product: Product) => void;
  /** Set an explicit quantity (typed into the stepper); qty ≤ 0 removes the line. */
  setQty: (product: Product, qty: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  setStandardDiscount: (percent: number) => void;
  setSpecialDiscount: (percent: number) => void;
  setTransportMode: (mode: string) => void;
  clear: () => void;
  /** Quantity of a product currently in the cart (0 if absent). */
  qtyOf: (productId: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  standardDiscountPercent: 0,
  specialDiscountPercent: 0,
  transportMode: '',

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

  setQty: (product, qty) =>
    set((state) => {
      const next = { ...state.items };
      if (qty <= 0) {
        delete next[product.id];
      } else {
        next[product.id] = { product, qty: Math.floor(qty) };
      }
      return { items: next };
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

  setStandardDiscount: (percent) =>
    set({ standardDiscountPercent: Math.min(100, Math.max(0, percent)) }),

  setSpecialDiscount: (percent) =>
    set({ specialDiscountPercent: Math.min(100, Math.max(0, percent)) }),

  setTransportMode: (mode) => set({ transportMode: mode }),

  clear: () =>
    set({
      items: {},
      standardDiscountPercent: 0,
      specialDiscountPercent: 0,
      transportMode: '',
    }),

  qtyOf: (productId) => get().items[productId]?.qty ?? 0,
}));
