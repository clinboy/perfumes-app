"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  totalStock: number;
  size: string;
  category: string;
}

interface User {
  name: string;
  role: string;
}

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, prodRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/products"),
        ]);
        const meData = await meRes.json();
        const prodData = await prodRes.json();
        setUser(meData.user);
        const prods = prodData.products || [];
        setProducts(prods);
        setLowStock(prods.filter((p: Product) => p.totalStock <= 2 && p.totalStock > 0));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  const totalValue = products.reduce((sum, p) => sum + p.price * p.totalStock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);
  const originals = products.filter((p) => p.category === "Original");
  const quality11 = products.filter((p) => p.category === "Calidad 1:1");
  const imitation = products.filter((p) => p.category === "Imitación");

  const stats = [
    { label: "Productos", value: products.length, icon: "🧴", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
    { label: "En stock", value: totalStock, icon: "📦", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Valor total", value: `$${totalValue.toLocaleString()}`, icon: "💰", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30" },
    { label: "Stock bajo", value: lowStock.length, icon: "⚠️", color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30" },
  ];

  const categories = [
    { label: "Original", count: originals.length, stock: originals.reduce((s, p) => s + p.totalStock, 0), color: "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20", textColor: "text-amber-800 dark:text-amber-300", badgeColor: "bg-amber-200 dark:bg-amber-800" },
    { label: "Calidad 1:1", count: quality11.length, stock: quality11.reduce((s, p) => s + p.totalStock, 0), color: "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-800 dark:text-blue-300", badgeColor: "bg-blue-200 dark:bg-blue-800" },
    { label: "Imitación", count: imitation.length, stock: imitation.reduce((s, p) => s + p.totalStock, 0), color: "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-800 dark:text-purple-300", badgeColor: "bg-purple-200 dark:bg-purple-800" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Hola, {user?.name} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Resumen de tu inventario</p>
      </div>

      <div className="grid grid-cols-2 gap-3 stagger">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100/50 dark:border-gray-700/50`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href="/dashboard/productos"
            className={`flex items-center justify-between p-4 rounded-2xl border ${cat.color} transition-all duration-200 active:scale-[0.98]`}
          >
            <div>
              <p className={`font-semibold ${cat.textColor}`}>{cat.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat.count} productos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`${cat.badgeColor} px-3 py-1 rounded-full`}>
                <span className={`text-sm font-bold ${cat.textColor}`}>{cat.stock} uds</span>
              </div>
              <svg className={`w-5 h-5 ${cat.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <h2 className="font-semibold text-red-800 dark:text-red-300">Stock bajo</h2>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 rounded-xl px-3 py-2">
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">{p.name} {p.size && `(${p.size})`}</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">{p.totalStock} uds</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/dashboard/productos/nuevo"
        className="block bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md text-center active:scale-95"
      >
        + Nuevo Producto
      </Link>
    </div>
  );
}
