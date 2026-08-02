import { useEffect, useState } from "react";
import { ShoppingCart, Plus } from "lucide-react";
import { API_BASE } from "../lib/api";
import { useCart } from "../store/cart";

interface Product {
  id: number;
  name: string;
  price_cents: number;
  description: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const { items, add } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((j) => setProducts(j.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div data-testid="shop-page" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Shop</h2>
        <a
          href="/cart"
          className="flex items-center gap-2 rounded bg-zinc-800 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          <ShoppingCart size={16} /> Cart ({items.length})
        </a>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="text-sm font-medium text-zinc-100">{p.name}</div>
            <div className="mt-1 text-xs text-zinc-500">{p.description}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-amber-500">{(p.price_cents / 100).toFixed(2)} EUR</span>
              <button
                data-testid={`add-${p.id}`}
                onClick={() => add(p)}
                className="rounded bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700"
                title="Add to cart"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}