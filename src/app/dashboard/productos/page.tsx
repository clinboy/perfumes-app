"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [categoryFilter, setCategoryFilter] = useState("");

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "Original": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Calidad 1:1": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Imitación": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-sm text-gray-500">{filtered.length} de {products.length} productos</p>
        </div>
        <Link
          href="/dashboard/productos/nuevo"
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md text-center active:scale-95"
        >
          + Nuevo
        </Link>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar perfume..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white shadow-sm transition-all duration-200 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { value: "", label: "Todos", count: products.length },
          { value: "Original", label: "Original", count: products.filter(p => p.category === "Original").length },
          { value: "Calidad 1:1", label: "Calidad 1:1", count: products.filter(p => p.category === "Calidad 1:1").length },
          { value: "Imitación", label: "Imitación", count: products.filter(p => p.category === "Imitación").length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategoryFilter(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              categoryFilter === tab.value
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${categoryFilter === tab.value ? "text-amber-200" : "text-gray-400"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">Cargando productos...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500 text-lg">
            {search || categoryFilter ? "No se encontraron productos" : "No hay productos"}
          </p>
          {!search && !categoryFilter && (
            <Link href="/dashboard/productos/nuevo" className="text-amber-600 hover:underline mt-2 inline-block font-medium">
              Agregar el primero
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/productos/${p.id}`)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:border-amber-200 transition-all duration-200 cursor-pointer active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
                  {p.size && <span className="text-xs text-gray-400">{p.size}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {p.category && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${categoryColor(p.category)}`}>
                      {p.category}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { name: "Mercadito", value: p.stockMercadito, bg: "bg-blue-50", text: "text-blue-600" },
                      { name: "Boutique", value: p.stockBoutique, bg: "bg-green-50", text: "text-green-600" },
                      { name: "Miravalle", value: p.stockMiravalle, bg: "bg-purple-50", text: "text-purple-600" },
                      { name: "Diamond", value: p.stockDiamond, bg: "bg-yellow-50", text: "text-yellow-600" },
                      { name: "Morelos", value: p.stockMorelos, bg: "bg-pink-50", text: "text-pink-600" },
                    ].filter((s) => s.value > 0).map((s) => (
                      <span key={s.name} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>
                        {s.name} {s.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-800">${p.price.toLocaleString()}</div>
                <div className={`text-xs font-medium ${p.totalStock <= 2 ? "text-red-500" : "text-gray-400"}`}>
                  {p.totalStock} uds
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
