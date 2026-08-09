import { create } from 'zustand';

import { MAX_SAFE_QUANTITY } from '@/features/products/pricing';

import type { Product } from '@/types/product';
import type { CartLine } from '@/features/products/pricing';

/**
 * Purchase-order cart — the distributor's basket for a distributor→manufacturer
 * order. Kept entirely separate from the salesman `useCartStore` so the two
 * flows never collide. On submit the backend auto-splits these items into one
 * order per manufacturer (see features/purchaseOrders).
 */
/** Whole units. No business ceiling — only the precision bound (see pricing). */
const clampQty = (qty: number) =>
  Math.min(MAX_SAFE_QUANTITY, Math.max(1, Math.floor(qty)));

interface POCartState {
  /** Keyed by product id for O(1) qty lookups. */
  items: Record<string, CartLine>;
  /** Optional free-text transport mode — the only priced field the PO create
   * endpoint still accepts (see features/purchaseOrders/types). */
  transportMode: string;

  add: (product: Product) => void;
  /** Set a line to an exact quantity (used to prefill from a reorder
   * an explicit quantity); qty ≤ 0 removes the line. */
  setQty: (product: Product, qty: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  setTransportMode: (mode: string) => void;
  clear: () => void;
  qtyOf: (productId: string) => number;
}

export const usePOCartStore = create<POCartState>((set, get) => ({
  items: {},
  transportMode: '',

  add: (product) =>
    set((state) => {
      const existing = state.items[product.id];
      return {
        items: {
          ...state.items,
          [product.id]: { product, qty: clampQty(existing ? existing.qty + 1 : 1) },
        },
      };
    }),

  setQty: (product, qty) =>
    set((state) => {
      const next = { ...state.items };
      if (qty <= 0) delete next[product.id];
      else next[product.id] = { product, qty: clampQty(qty) };
      return { items: next };
    }),

  increment: (productId) =>
    set((state) => {
      const line = state.items[productId];
      if (!line) return state;
      return {
        items: {
          ...state.items,
          [productId]: { ...line, qty: clampQty(line.qty + 1) },
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
        items: { ...state.items, [productId]: { ...line, qty: line.qty - 1 } },
      };
    }),

  remove: (productId) =>
    set((state) => {
      const next = { ...state.items };
      delete next[productId];
      return { items: next };
    }),

  setTransportMode: (mode) => set({ transportMode: mode }),

  clear: () => set({ items: {}, transportMode: '' }),

  qtyOf: (productId) => get().items[productId]?.qty ?? 0,
}));
