"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  size: string;
  price: number;
  totalStock: number;
  stockMercadito: number;
  stockBoutique: number;
  stockMiravalle: number;
  stockDiamond: number;
  stockMorelos: number;
  category: string;
  imageUrl: string | null;
}

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.totalStock, 0);
  const totalValue = products.reduce((s, p) => s + p.price * p.totalStock, 0);
  const lowStock = products.filter((p) => p.totalStock <= 2 && p.totalStock > 0).length;
  const outOfStock = products.filter((p) => p.totalStock === 0).length;

  const byCategory = [
    { label: "Original", count: products.filter((p) => p.category === "Original").length, color: "bg-amber-500" },
    { label: "Calidad 1:1", count: products.filter((p) => p.category === "Calidad 1:1").length, color: "bg-blue-500" },
    { label: "Imitación", count: products.filter((p) => p.category === "Imitación").length, color: "bg-purple-500" },
    { label: "Sin categoría", count: products.filter((p) => !p.category).length, color: "bg-gray-400" },
  ];

  const branches = [
    { name: "Mercadito", stock: products.reduce((s, p) => s + p.stockMercadito, 0), color: "text-blue-600 dark:text-blue-400" },
    { name: "Boutique", stock: products.reduce((s, p) => s + p.stockBoutique, 0), color: "text-green-600 dark:text-green-400" },
    { name: "Miravalle", stock: products.reduce((s, p) => s + p.stockMiravalle, 0), color: "text-purple-600 dark:text-purple-400" },
    { name: "Diamond", stock: products.reduce((s, p) => s + p.stockDiamond, 0), color: "text-yellow-600 dark:text-yellow-400" },
    { name: "Morelos", stock: products.reduce((s, p) => s + p.stockMorelos, 0), color: "text-pink-600 dark:text-pink-400" },
  ];

  const topProducts = [...products].sort((a, b) => b.totalStock - a.totalStock).slice(0, 5);
  const lowStockProducts = products.filter((p) => p.totalStock <= 2 && p.totalStock > 0).sort((a, b) => a.totalStock - b.totalStock);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reportes</h1>
        <button
          onClick={() => {
            const rows = products.map(p => [p.name, p.size, p.category, p.price, p.totalStock, p.stockMercadito, p.stockBoutique, p.stockMiravalle, p.stockDiamond, p.stockMorelos].join(","));
            const csv = "Nombre,Tamaño,Categoría,Precio,Total,Mercadito,Boutique,Miravalle,Diamond,Morelos\n" + rows.join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "inventario.csv";
            a.click();
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          📥 Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Productos", value: totalProducts, icon: "🧴" },
          { label: "Stock total", value: totalStock, icon: "📦" },
          { label: "Valor inventario", value: `$${totalValue.toLocaleString()}`, icon: "💰" },
          { label: "Sin stock", value: outOfStock, icon: "⚠️", alert: outOfStock > 0 },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border ${stat.alert ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-slate-700"}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.alert ? "text-red-600" : "text-gray-800 dark:text-white"}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Por categoría</h2>
        <div className="space-y-3">
          {byCategory.map((cat) => (
            <div key={cat.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300 w-28">{cat.label}</span>
              <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                <div className={`${cat.color} h-full rounded-full transition-all`} style={{ width: totalProducts ? `${(cat.count / totalProducts) * 100}%` : "0%" }} />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-white w-8 text-right">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Stock por sucursal</h2>
        <div className="grid grid-cols-5 gap-3">
          {branches.map((b) => (
            <div key={b.name} className="text-center">
              <div className={`text-xl font-bold ${b.color}`}>{b.stock}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{b.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Top 5 con más stock</h2>
        <div className="space-y-2">
          {topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-lg font-bold text-amber-600 w-6">{i + 1}</span>
              {p.imageUrl && <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />}
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">{p.totalStock} uds</span>
            </div>
          ))}
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-5">
          <h2 className="font-semibold text-red-600 mb-4">⚠️ Stock bajo ({lowStockProducts.length})</h2>
          <div className="space-y-2">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                {p.imageUrl && <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />}
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                <span className="text-sm font-bold text-red-600">{p.totalStock} uds</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
