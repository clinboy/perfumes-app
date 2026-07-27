"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  size: string;
  price: number;
  totalStock: number;
  category: string;
  imageUrl: string | null;
  isFavorite: number;
}

export default function FavoritosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const favs = (d.products || []).filter((p: Product) => p.isFavorite);
        setProducts(favs);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleFavorite(id: number) {
    await fetch("/api/products/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "Original": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      case "Calidad 1:1": return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "Imitación": return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Favoritos</h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">⭐</div>
          <p className="text-gray-500 dark:text-gray-400">No tienes productos favoritos</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">En la lista de productos, toca la estrella para agregar uno</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/productos/${p.id}`)}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700 transition-all cursor-pointer"
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{p.name}</h3>
                  {p.size && <span className="text-xs text-gray-400">{p.size}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {p.category && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColor(p.category)}`}>
                      {p.category}
                    </span>
                  )}
                  <span className={`text-xs ${p.totalStock <= 2 ? "text-red-500" : "text-gray-400"}`}>
                    {p.totalStock} uds
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-800 dark:text-white">${p.price.toLocaleString()}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                className="flex-shrink-0 p-2 text-amber-500 hover:text-gray-300 transition-colors"
                title="Quitar de favoritos"
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
