"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

interface ProductForm {
  name: string;
  size: string;
  price: string;
  totalStock: string;
  stockMercadito: string;
  stockBoutique: string;
  stockMiravalle: string;
  stockDiamond: string;
  stockMorelos: string;
  notes: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<ProductForm>({
    name: "",
    size: "",
    price: "",
    totalStock: "",
    stockMercadito: "",
    stockBoutique: "",
    stockMiravalle: "",
    stockDiamond: "",
    stockMorelos: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
            totalStock: String(data.product.totalStock),
            stockMercadito: String(data.product.stockMercadito),
            stockBoutique: String(data.product.stockBoutique),
            stockMiravalle: String(data.product.stockMiravalle),
            stockDiamond: String(data.product.stockDiamond),
            stockMorelos: String(data.product.stockMorelos),
            notes: data.product.notes || "",
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
          totalStock: parseInt(form.totalStock) || 0,
          stockMercadito: parseInt(form.stockMercadito) || 0,
          stockBoutique: parseInt(form.stockBoutique) || 0,
          stockMiravalle: parseInt(form.stockMiravalle) || 0,
          stockDiamond: parseInt(form.stockDiamond) || 0,
          stockMorelos: parseInt(form.stockMorelos) || 0,
          notes: form.notes,
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

  if (loadingData) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Producto</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
            <input
              type="text"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock</label>
            <input
              type="number"
              value={form.totalStock}
              onChange={(e) => setForm({ ...form, totalStock: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Stock por Sucursal</p>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mercadito</label>
              <input
                type="number"
                value={form.stockMercadito}
                onChange={(e) => setForm({ ...form, stockMercadito: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Boutique</label>
              <input
                type="number"
                value={form.stockBoutique}
                onChange={(e) => setForm({ ...form, stockBoutique: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Miravalle</label>
              <input
                type="number"
                value={form.stockMiravalle}
                onChange={(e) => setForm({ ...form, stockMiravalle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Diamond Barber</label>
              <input
                type="number"
                value={form.stockDiamond}
                onChange={(e) => setForm({ ...form, stockDiamond: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Morelos</label>
              <input
                type="number"
                value={form.stockMorelos}
                onChange={(e) => setForm({ ...form, stockMorelos: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            rows={2}
          />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/productos")}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-2.5 rounded-lg font-medium transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
