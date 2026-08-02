import { useState } from "react";
import { Trash2, CheckCircle2 } from "lucide-react";
import { API_BASE } from "../lib/api";
import { useCart } from "../store/cart";

export default function Cart() {
  const { items, remove, clear, total } = useCart();
  const [placed, setPlaced] = useState(false);

  const checkout = async () => {
    const r = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: JSON.stringify(items), total_cents: total() }),
    });
    if (r.ok) {
      setPlaced(true);
      clear();
    }
  };

  if (placed) {
    return (
      <div data-testid="cart-page" className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Cart</h2>
        <div className="flex items-center gap-2 rounded-lg border border-green-800 bg-green-950/40 p-4 text-green-400">
          <CheckCircle2 size={18} /> Order placed. Thanks!
        </div>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold text-white">Cart</h2>
      {items.map((i) => (
        <div key={i.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <div>
            <div className="text-sm text-zinc-200">{i.name}</div>
            <div className="text-xs text-zinc-500">
              qty {i.qty} x {(i.price_cents / 100).toFixed(2)} EUR
            </div>
          </div>
          <button onClick={() => remove(i.id)} className="text-zinc-600 hover:text-red-400" title="Remove">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {items.length === 0 && <p className="text-zinc-500">Cart is empty. Head to the Shop.</p>}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-300">
          Total: <span className="text-amber-500">{(total() / 100).toFixed(2)} EUR</span>
        </span>
        <button
          data-testid="checkout"
          onClick={checkout}
          disabled={items.length === 0}
          className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}