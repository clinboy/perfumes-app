"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  totalStock: number;
  size: string;
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
        setProducts(prodData.products || []);
        setLowStock((prodData.products || []).filter((p: Product) => p.totalStock <= 2));
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
        <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalValue = products.reduce((sum, p) => sum + p.price * p.totalStock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {user?.name}</h1>
        <p className="text-gray-500">Panel de control de inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Productos</p>
          <p className="text-3xl font-bold text-amber-700">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Stock</p>
          <p className="text-3xl font-bold text-blue-700">{totalStock}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Valor del Inventario</p>
          <p className="text-3xl font-bold text-green-700">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Stock Bajo</p>
          <p className="text-3xl font-bold text-red-700">{lowStock.length}</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="font-semibold text-red-800 mb-3">Productos con stock bajo</h2>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-red-700">{p.name} {p.size && `(${p.size})`}</span>
                <span className="font-semibold text-red-700">{p.totalStock} uds.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard/productos/nuevo"
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Nuevo Producto
        </Link>
        <Link
          href="/dashboard/importar"
          className="bg-white border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium transition"
        >
          Importar Excel
        </Link>
      </div>
    </div>
  );
}
