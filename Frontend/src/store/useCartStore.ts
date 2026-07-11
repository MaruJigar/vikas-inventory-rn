import { create } from 'zustand';

import type { Product } from '@/types/product';
import type {
  BillDiscount,
  CartLine,
  DiscountType,
} from '@/features/products/pricing';

interface CartState {
  /** Keyed by product id for O(1) qty lookups. */
  items: Record<string, CartLine>;
  /** A single order-level (bill) discount applied to the whole cart. */
  billDiscount: BillDiscount;

  add: (product: Product) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  /** Set (or clear, with NONE/0) the whole-order discount. */
  setBillDiscount: (type: DiscountType, value: number) => void;
  clear: () => void;
  /** Quantity of a product currently in the cart (0 if absent). */
  qtyOf: (productId: string) => number;
}

const NO_DISCOUNT: BillDiscount = { type: 'NONE', value: 0 };

export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  billDiscount: NO_DISCOUNT,

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

  setBillDiscount: (type, value) =>
    set({ billDiscount: { type, value: type === 'NONE' ? 0 : value } }),

  clear: () => set({ items: {}, billDiscount: NO_DISCOUNT }),

  qtyOf: (productId) => get().items[productId]?.qty ?? 0,
}));
