"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  totalStock: number;
  stockMercadito: number;
  stockBoutique: number;
  stockMiravalle: number;
  stockDiamond: number;
  stockMorelos: number;
  imageUrl: string | null;
}

interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  location: string;
  imageUrl: string | null;
  createdAt: string;
}

const LOCATIONS = ["Mercadito", "Boutique", "Miravalle", "Diamond", "Morelos"];

export default function VentasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [location, setLocation] = useState("Mercadito");
  const [quantity, setQuantity] = useState("1");
  const [selling, setSelling] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/sales").then((r) => r.json()),
    ]).then(([p, s]) => {
      setProducts(p.products || []);
      setSales(s.sales || []);
    }).finally(() => setLoading(false));
  }, []);

  const availableStock = selectedProduct
    ? (selectedProduct as unknown as Record<string, number>)[`stock${location}`] || 0
    : 0;

  async function handleSale() {
    if (!selectedProduct) return;
    setSelling(true);
    try {
      await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseInt(quantity) || 1,
          price: selectedProduct.price,
          location,
        }),
      });
      const [p, s] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/sales").then((r) => r.json()),
      ]);
      setProducts(p.products || []);
      setSales(s.sales || []);
      setShowForm(false);
      setSelectedProduct(null);
      setQuantity("1");
    } finally {
      setSelling(false);
    }
  }

  const todaySales = sales.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const todayTotal = todaySales.reduce((sum, s) => sum + s.price * s.quantity, 0);

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ventas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hoy: {todaySales.length} ventas — ${todayTotal.toLocaleString()}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
        >
          + Vender
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
              {products.filter(p => p.totalStock > 0).map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sucursal</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Cantidad (disponible: {availableStock})</label>
              <input
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total: </span>
              <span className="font-bold text-gray-800 dark:text-white">${selectedProduct.price * (parseInt(quantity) || 1)}</span>
            </div>
          )}

          <button
            onClick={handleSale}
            disabled={!selectedProduct || selling || parseInt(quantity) > availableStock}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {selling ? "Procesando..." : "Registrar venta"}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">Historial de ventas</h2>
        </div>
        {sales.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin ventas registradas</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {sales.slice(0, 50).map((s) => (
              <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                {s.imageUrl && <img src={s.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{s.productName}</div>
                  <div className="text-xs text-gray-400">{s.location} · {s.quantity} ud{s.quantity > 1 ? "s" : ""}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">${(s.price * s.quantity).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
