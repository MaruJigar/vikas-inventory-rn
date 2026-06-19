import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { calculateCartTotals } from '../utils/cartCalculator';

const generateIdempotencyKey = () => {
  if (Crypto && Crypto.randomUUID) {
    return Crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Date.now() + Math.random()*16)%16 | 0;
    return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
  });
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      visitId: null,
      shopId: null,
      items: [], // Array of { productId, mrp, quantity, itemDiscountType, itemDiscountValue }
      billDiscountType: 'NONE',
      billDiscountValue: 0,
      idempotencyKey: null,
      
      initializeCart: (visitId, shopId) => set({ 
        visitId, 
        shopId, 
        items: [],
        billDiscountType: 'NONE',
        billDiscountValue: 0,
        idempotencyKey: generateIdempotencyKey()
      }),

      addItem: (product, quantity) => set((state) => {
        // If it's the very first item being added and no idempotencyKey exists (failsafe), generate one.
        const key = state.idempotencyKey || generateIdempotencyKey();

        const existingItem = state.items.find(i => i.productId === product.id);
        if (existingItem) {
          return {
            idempotencyKey: key,
            items: state.items.map(i => 
              i.productId === product.id 
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          };
        }
        return {
          idempotencyKey: key,
          items: [...state.items, {
            productId: product.id,
            name: product.name,
            mrp: product.mrp,
            quantity,
            itemDiscountType: 'NONE',
            itemDiscountValue: 0
          }]
        };
      }),

      updateItemQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(i => i.productId !== productId) };
        }
        return {
          items: state.items.map(i => 
            i.productId === productId ? { ...i, quantity } : i
          )
        };
      }),

      updateItemDiscount: (productId, type, value) => set((state) => ({
        items: state.items.map(i => 
          i.productId === productId 
            ? { ...i, itemDiscountType: type, itemDiscountValue: Number(value) || 0 }
            : i
        )
      })),

      updateBillDiscount: (type, value) => set({
        billDiscountType: type,
        billDiscountValue: Number(value) || 0
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),

      clearCart: () => set({ 
        items: [], 
        billDiscountType: 'NONE', 
        billDiscountValue: 0, 
        visitId: null, 
        shopId: null,
        idempotencyKey: null
      }),

      getTotals: () => {
        const state = get();
        return calculateCartTotals(state.items, state.billDiscountType, state.billDiscountValue);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
