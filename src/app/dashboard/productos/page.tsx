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
  imageUrl: string | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<"" | "low" | "out">("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setRole(d.user.role); })
      .catch(() => {});
  }, []);

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

  const hasActiveFilters = categoryFilter || locationFilter || priceMin || priceMax || stockFilter;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchLocation =
        !locationFilter ||
        (locationFilter === "Mercadito" && p.stockMercadito > 0) ||
        (locationFilter === "Boutique" && p.stockBoutique > 0) ||
        (locationFilter === "Miravalle" && p.stockMiravalle > 0) ||
        (locationFilter === "Diamond" && p.stockDiamond > 0) ||
        (locationFilter === "Morelos" && p.stockMorelos > 0);
      const matchPriceMin = !priceMin || p.price >= parseFloat(priceMin);
      const matchPriceMax = !priceMax || p.price <= parseFloat(priceMax);
      const matchStock =
        stockFilter === "low" ? p.totalStock > 0 && p.totalStock <= 2 :
        stockFilter === "out" ? p.totalStock === 0 :
        true;
      return matchSearch && matchCategory && matchLocation && matchPriceMin && matchPriceMax && matchStock;
    });
  }, [products, search, categoryFilter, locationFilter, priceMin, priceMax, stockFilter]);

  const lowStockCount = products.filter((p) => p.totalStock > 0 && p.totalStock <= 2).length;
  const outStockCount = products.filter((p) => p.totalStock === 0).length;

  function clearFilters() {
    setCategoryFilter("");
    setLocationFilter("");
    setPriceMin("");
    setPriceMax("");
    setStockFilter("");
  }

  function exportCSV() {
    const rows = [
      ["Nombre", "Tamaño", "Categoría", "Precio", "Total", "Mercadito", "Boutique", "Miravalle", "Diamond", "Morelos"],
      ...filtered.map((p) => [
        p.name,
        p.size || "",
        p.category || "",
        p.price,
        p.totalStock,
        p.stockMercadito,
        p.stockBoutique,
        p.stockMiravalle,
        p.stockDiamond,
        p.stockMorelos,
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventario.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id: number, name: string) {
    const first = confirm(`¿Eliminar "${name}"?`);
    if (!first) return;
    const second = confirm(`¿Estás seguro? Esta acción no se puede deshacer.`);
    if (!second) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "Original": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700";
      case "Calidad 1:1": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700";
      case "Imitación": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700";
      default: return "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600";
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Productos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} de {products.length} productos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:border-amber-300 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm"
          >
            ⬇️ Excel
          </button>
          {role === "admin" && (
            <Link
              href="/dashboard/productos/nuevo"
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md text-center active:scale-95"
            >
              + Nuevo
            </Link>
          )}
        </div>
      </div>

      {lowStockCount > 0 && (
        <button
          onClick={() => setStockFilter(stockFilter === "low" ? "" : "low")}
          className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
            stockFilter === "low"
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
          }`}
        >
          ⚠️ Stock bajo ({lowStockCount}) — quedan 2 o menos unidades
        </button>
      )}
      {outStockCount > 0 && (
        <button
          onClick={() => setStockFilter(stockFilter === "out" ? "" : "out")}
          className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
            stockFilter === "out"
              ? "bg-red-600 text-white border-red-600"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}
        >
          🚫 Sin stock ({outStockCount}) — agotados
        </button>
      )}

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar perfume..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white dark:bg-slate-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all duration-200 text-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        )}
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
          showFilters || hasActiveFilters
            ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-amber-300 hover:text-amber-700"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros
        {hasActiveFilters && (
          <span className="bg-amber-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {[categoryFilter, locationFilter, priceMin, priceMax].filter(Boolean).length}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Categoría</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all">
                <option value="">Todas</option>
                <option value="Original">Original</option>
                <option value="Calidad 1:1">Calidad 1:1</option>
                <option value="Imitación">Imitación</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sucursal con stock</label>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all">
                <option value="">Todas</option>
                <option value="Mercadito">Mercadito</option>
                <option value="Boutique">Boutique</option>
                <option value="Miravalle">Miravalle</option>
                <option value="Diamond">Diamond</option>
                <option value="Morelos">Morelos</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Rango de precios</label>
            <div className="flex items-center gap-2">
              <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Mín" className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
              <span className="text-gray-400">—</span>
              <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Máx" className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium">Limpiar filtros</button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando productos...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {search || hasActiveFilters ? "No se encontraron productos" : "No hay productos"}
          </p>
          {!search && !hasActiveFilters && role === "admin" && (
            <Link href="/dashboard/productos/nuevo" className="text-amber-600 dark:text-amber-400 hover:underline mt-2 inline-block font-medium">Agregar el primero</Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              onClick={() => role === "admin" && router.push(`/dashboard/productos/${p.id}`)}
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{p.name}</h3>
                  {p.size && <span className="text-xs text-gray-400 dark:text-gray-500">{p.size}</span>}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {p.category && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${categoryColor(p.category)}`}>
                      {p.category}
                    </span>
                  )}
                  {p.totalStock === 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">Sin stock</span>
                  )}
                  {p.totalStock > 0 && p.totalStock <= 2 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">¡Stock bajo!</span>
                  )}
                  {[
                    { name: "Mercadito", value: p.stockMercadito, bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
                    { name: "Boutique", value: p.stockBoutique, bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
                    { name: "Miravalle", value: p.stockMiravalle, bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
                    { name: "Diamond", value: p.stockDiamond, bg: "bg-yellow-50 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400" },
                    { name: "Morelos", value: p.stockMorelos, bg: "bg-pink-50 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
                  ].filter((s) => s.value > 0).map((s) => (
                    <span key={s.name} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>
                      {s.name} {s.value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800 dark:text-white">${p.price.toLocaleString()}</div>
                  <div className={`text-[11px] font-medium ${p.totalStock <= 2 ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
                    {p.totalStock} uds
                  </div>
                </div>
                {role === "admin" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}
                    className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
