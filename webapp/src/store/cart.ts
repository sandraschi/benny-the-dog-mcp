import { create } from "zustand";

export interface CartItem {
  id: number;
  name: string;
  price_cents: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (p: { id: number; name: string; price_cents: number }) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: () => number;
}

const KEY = "benny-the-dog-mcp-cart";

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export const useCart = create<CartState>((set, get) => ({
  items: load(),
  add: (p) =>
    set((s) => {
      const found = s.items.find((i) => i.id === p.id);
      const items = found
        ? s.items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...s.items, { ...p, qty: 1 }];
      localStorage.setItem(KEY, JSON.stringify(items));
      return { items };
    }),
  remove: (id) =>
    set((s) => {
      const items = s.items.filter((i) => i.id !== id);
      localStorage.setItem(KEY, JSON.stringify(items));
      return { items };
    }),
  clear: () => {
    localStorage.removeItem(KEY);
    set({ items: [] });
  },
  total: () => get().items.reduce((sum, i) => sum + i.price_cents * i.qty, 0),
}));