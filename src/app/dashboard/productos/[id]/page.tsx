"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

interface ProductForm {
  name: string;
  size: string;
  price: string;
  cost: string;
  totalStock: string;
  stockMercadito: string;
  stockBoutique: string;
  stockMiravalle: string;
  stockDiamond: string;
  stockMorelos: string;
  notes: string;
  category: string;
  imageUrl: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [role, setRole] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    size: "",
    price: "",
    cost: "",
    totalStock: "",
    stockMercadito: "",
    stockBoutique: "",
    stockMiravalle: "",
    stockDiamond: "",
    stockMorelos: "",
    notes: "",
    category: "",
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setRole(d.user.role); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        if (data.product) {
          setForm({
            name: data.product.name,
            size: data.product.size || "",
            price: String(data.product.price),
            cost: String(data.product.cost || 0),
            totalStock: String(data.product.totalStock),
            stockMercadito: String(data.product.stockMercadito),
            stockBoutique: String(data.product.stockBoutique),
            stockMiravalle: String(data.product.stockMiravalle),
            stockDiamond: String(data.product.stockDiamond),
            stockMorelos: String(data.product.stockMorelos),
            notes: data.product.notes || "",
            category: data.product.category || "",
            imageUrl: data.product.imageUrl || "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [params.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          size: form.size,
          price: parseFloat(form.price) || 0,
          cost: parseFloat(form.cost) || 0,
          totalStock: parseInt(form.totalStock) || 0,
          stockMercadito: parseInt(form.stockMercadito) || 0,
          stockBoutique: parseInt(form.stockBoutique) || 0,
          stockMiravalle: parseInt(form.stockMiravalle) || 0,
          stockDiamond: parseInt(form.stockDiamond) || 0,
          stockMorelos: parseInt(form.stockMorelos) || 0,
          notes: form.notes,
          category: form.category,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al actualizar");
        return;
      }

      router.push("/dashboard/productos");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-gray-800 dark:text-white";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Editar Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden space-y-0 transition-colors">
        {form.imageUrl && (
          <>
            <img
              src={form.imageUrl}
              alt={form.name}
              className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImage(true)}
            />
            {showImage && (
              <div
                className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-16 p-4 cursor-pointer"
                onClick={() => setShowImage(false)}
              >
                <img
                  src={form.imageUrl}
                  alt={form.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </>
        )}
        <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Tamaño</label>
            <input
              type="text"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Precio</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}
            >
              <option value="">Sin categoría</option>
              <option value="Original">Original</option>
              <option value="Calidad 1:1">Calidad 1:1</option>
              <option value="Imitación">Imitación</option>
            </select>
          </div>
        </div>

        {role === "superadmin" && (
          <div>
            <label className={labelClass}>Costo de compra (por unidad)</label>
            <input
              type="number"
              step="0.01"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className={inputClass}
              placeholder="$0"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Solo visible para el super admin</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock por Sucursal</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Los cambios se registrarán automáticamente en Movimientos</p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { key: "stockMercadito", label: "Mercadito", color: "focus:ring-blue-500" },
              { key: "stockBoutique", label: "Boutique", color: "focus:ring-green-500" },
              { key: "stockMiravalle", label: "Miravalle", color: "focus:ring-purple-500" },
              { key: "stockDiamond", label: "Diamond", color: "focus:ring-yellow-500" },
              { key: "stockMorelos", label: "Morelos", color: "focus:ring-pink-500" },
            ].map((s) => (
              <div key={s.key}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{s.label}</label>
                <input
                  type="number"
                  value={(form as unknown as Record<string, string>)[s.key]}
                  onChange={(e) => setForm({ ...form, [s.key]: e.target.value })}
                  className={`w-full px-2 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 ${s.color} focus:border-transparent outline-none text-center text-sm transition-all bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-gray-800 dark:text-white`}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-gray-800 dark:text-white resize-none"
            rows={2}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-xl">
            <span>⚠️</span>{error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/productos")}
            className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}
