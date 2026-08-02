"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  stockMercadito: number;
  stockBoutique: number;
  stockMiravalle: number;
  stockDiamond: number;
  stockMorelos: number;
  imageUrl: string | null;
}

interface Movement {
  id: number;
  productId: number;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  notes: string;
  imageUrl: string | null;
  createdAt: string;
}

const LOCATIONS = ["Mercadito", "Boutique", "Miravalle", "Diamond", "Morelos"];

export default function MovimientosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [from, setFrom] = useState("Mercadito");
  const [to, setTo] = useState("Boutique");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setRole(d.user.role); })
      .catch(() => {});
  }, []);

  const isAdmin = role === "admin";

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/movements").then((r) => r.json()),
    ]).then(([p, m]) => {
      setProducts(p.products || []);
      setMovements(m.movements || []);
    }).finally(() => setLoading(false));
  }, []);

  const availableStock = selectedProduct
    ? (selectedProduct as unknown as Record<string, number>)[`stock${from}`] || 0
    : 0;

  async function handleMove() {
    if (!selectedProduct || from === to) return;
    setSaving(true);
    try {
      await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          from,
          to,
          quantity: parseInt(quantity) || 1,
          notes,
        }),
      });
      const [p, m] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/movements").then((r) => r.json()),
      ]);
      setProducts(p.products || []);
      setMovements(m.movements || []);
      setShowForm(false);
      setSelectedProduct(null);
      setQuantity("1");
      setNotes("");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Movimientos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{movements.length} movimientos registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95 ${isAdmin ? "" : "hidden"}`}
        >
          + Mover
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4 animate-slide-up">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Producto</label>
            <select
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const p = products.find((x) => x.id === parseInt(e.target.value));
                setSelectedProduct(p || null);
              }}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">Seleccionar...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">De</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none">
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="text-center text-gray-400 pb-1">→</div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">A</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none">
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Cantidad (disponible: {availableStock})</label>
              <input type="number" min="1" max={availableStock} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Notas</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
          </div>

          {from === to && (
            <p className="text-sm text-red-500">Las sucursales de origen y destino deben ser diferentes</p>
          )}

          <button
            onClick={handleMove}
            disabled={!selectedProduct || from === to || saving || parseInt(quantity) > availableStock}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? "Procesando..." : "Registrar movimiento"}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">Historial de movimientos</h2>
        </div>
        {movements.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin movimientos registrados</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {movements.slice(0, 50).map((m) => (
              <div key={m.id} className="px-4 py-3 flex items-center gap-3">
                {m.imageUrl && <img src={m.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{m.productName}</div>
                  <div className="text-xs text-gray-400">
                    {m.fromLocation} → {m.toLocation} · {m.quantity} ud{m.quantity > 1 ? "s" : ""}
                    {m.notes ? ` · ${m.notes}` : ""}
                  </div>
                </div>
                <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
