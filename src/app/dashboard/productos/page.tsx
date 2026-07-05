"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  notes: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadProducts();
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos ({products.length})</h1>
        <Link
          href="/dashboard/productos/nuevo"
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition text-center"
        >
          + Nuevo Producto
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
        />
        <button type="submit" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium transition">
          Buscar
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No hay productos</p>
          <Link href="/dashboard/productos/nuevo" className="text-amber-600 hover:underline mt-2 inline-block">
            Agregar el primero
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-3 font-medium">Producto</th>
                <th className="text-left px-3 py-3 font-medium">Tamaño</th>
                <th className="text-right px-3 py-3 font-medium">Precio</th>
                <th className="text-right px-3 py-3 font-medium">Stock</th>
                <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Stock por Sucursal</th>
                <th className="text-center px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-3 font-medium">{p.name}</td>
                  <td className="px-3 py-3 text-gray-600">{p.size || "-"}</td>
                  <td className="px-3 py-3 text-right">${p.price.toFixed(2)}</td>
                  <td className={`px-3 py-3 text-right font-medium ${p.totalStock <= 2 ? "text-red-600" : ""}`}>
                    {p.totalStock}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 hidden md:table-cell">
                    <div className="flex gap-2 flex-wrap">
                      {p.stockMercadito > 0 && <span className="bg-blue-100 px-2 py-0.5 rounded">M: {p.stockMercadito}</span>}
                      {p.stockBoutique > 0 && <span className="bg-green-100 px-2 py-0.5 rounded">B: {p.stockBoutique}</span>}
                      {p.stockMiravalle > 0 && <span className="bg-purple-100 px-2 py-0.5 rounded">Mi: {p.stockMiravalle}</span>}
                      {p.stockDiamond > 0 && <span className="bg-yellow-100 px-2 py-0.5 rounded">D: {p.stockDiamond}</span>}
                      {p.stockMorelos > 0 && <span className="bg-pink-100 px-2 py-0.5 rounded">Mo: {p.stockMorelos}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/productos/${p.id}`)}
                        className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
