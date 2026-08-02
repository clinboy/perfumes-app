"use client";

import { useEffect, useState, useMemo } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
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
  paymentType: string;
  amountPaid: number;
  createdAt: string;
}

interface Purchase {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  location: string;
  notes: string;
  userName: string;
  createdAt: string;
}

interface HistoricalPurchase {
  id: number;
  date: string;
  code: string;
  product: string;
  quantity: number;
  unitCost: number;
  total: number;
  order: string;
  supplier: string;
}

interface HistoricalSale {
  id: number;
  date: string;
  articleId: string;
  product: string;
  channel: string;
  unitCost: number;
  grossIncome: number;
  quantity: number;
  variableExpenses: number;
  grossProfit: number;
  netProfit: number;
  order: string;
}

const LOCATIONS = ["Mercadito", "Boutique", "Miravalle", "Diamond", "Morelos"];

export default function FinanzasPage() {
  const [tab, setTab] = useState<"compras" | "analisis" | "historico">("compras");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [historicalPurchases, setHistoricalPurchases] = useState<HistoricalPurchase[]>([]);
  const [historicalSales, setHistoricalSales] = useState<HistoricalSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [form, setForm] = useState({ productId: "", quantity: "1", unitCost: "", location: "Mercadito", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== "superadmin") {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setAuthorized(true);
        Promise.all([
          fetch("/api/products").then((r) => r.json()),
          fetch("/api/sales").then((r) => r.json()),
          fetch("/api/purchases").then((r) => r.json()),
          fetch("/api/historico").then((r) => r.json()),
        ])
          .then(([p, s, pu, h]) => {
            setProducts(p.products || []);
            setSales(s.sales || []);
            setPurchases(pu.purchases || []);
            setHistoricalPurchases(h.purchases || []);
            setHistoricalSales(h.sales || []);
          })
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedProduct = products.find((p) => p.id === parseInt(form.productId));

  function updateForm(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleRegister() {
    if (!selectedProduct) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseInt(form.quantity) || 1,
          unitCost: parseFloat(form.unitCost) || 0,
          location: form.location,
          notes: form.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al registrar compra");
        return;
      }
      const [p, pu] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/purchases").then((r) => r.json()),
      ]);
      setProducts(p.products || []);
      setPurchases(pu.purchases || []);
      setForm((f) => ({ ...f, quantity: "1", unitCost: "", notes: "" }));
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  const analysis = useMemo(() => {
    const soldMap: Record<number, { units: number; revenue: number }> = {};
    for (const s of sales) {
      const entry = soldMap[s.productId] || { units: 0, revenue: 0 };
      entry.units += s.quantity;
      entry.revenue += s.price * s.quantity;
      soldMap[s.productId] = entry;
    }

    const rows = products.map((p) => {
      const sold = soldMap[p.id] || { units: 0, revenue: 0 };
      const cost = p.cost || 0;
      const cogs = cost * sold.units;
      const profit = sold.revenue - cogs;
      return {
        ...p,
        unitsSold: sold.units,
        revenue: sold.revenue,
        cogs,
        profit,
        margin: sold.revenue > 0 ? (profit / sold.revenue) * 100 : 0,
        inventoryCost: cost * p.totalStock,
        inventoryValue: p.price * p.totalStock,
      };
    });

    const totals = rows.reduce(
      (acc, r) => ({
        revenue: acc.revenue + r.revenue,
        cogs: acc.cogs + r.cogs,
        profit: acc.profit + r.profit,
        inventoryCost: acc.inventoryCost + r.inventoryCost,
        inventoryValue: acc.inventoryValue + r.inventoryValue,
      }),
      { revenue: 0, cogs: 0, profit: 0, inventoryCost: 0, inventoryValue: 0 }
    );

    return { rows, totals };
  }, [products, sales]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Acceso restringido</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Esta sección es privada y solo está disponible para el administrador principal.</p>
      </div>
    );
  }

  const { rows, totals } = analysis;

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Finanzas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Compras y análisis financiero</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("compras")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "compras" ? "bg-amber-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"}`}
        >
          🛒 Compras
        </button>
        <button
          onClick={() => setTab("analisis")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "analisis" ? "bg-amber-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"}`}
        >
          📊 Análisis financiero
        </button>
        <button
          onClick={() => setTab("historico")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "historico" ? "bg-amber-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"}`}
        >
          📜 Histórico
        </button>
      </div>

      {tab === "compras" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 dark:text-white">Registrar compra</h2>
            <div>
              <label className={labelClass}>Producto</label>
              <select
                value={form.productId}
                onChange={(e) => updateForm("productId", e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ${p.price.toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Cantidad</label>
                <input type="number" min="1" value={form.quantity} onChange={(e) => updateForm("quantity", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Costo unitario</label>
                <input type="number" min="0" step="0.01" value={form.unitCost} onChange={(e) => updateForm("unitCost", e.target.value)} className={inputClass} placeholder="$0" />
              </div>
              <div>
                <label className={labelClass}>Sucursal</label>
                <select value={form.location} onChange={(e) => updateForm("location", e.target.value)} className={inputClass}>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Costo actual: </span>
                <span className="font-bold text-gray-800 dark:text-white">${(selectedProduct.cost || 0).toLocaleString()}</span>
                <span className="text-gray-500 dark:text-gray-400 mx-2">·</span>
                <span className="text-gray-500 dark:text-gray-400">Total compra: </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ${((parseFloat(form.unitCost) || 0) * (parseInt(form.quantity) || 1)).toLocaleString()}
                </span>
              </div>
            )}

            <div>
              <label className={labelClass}>Notas</label>
              <input type="text" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} className={inputClass} placeholder="Opcional" />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleRegister}
              disabled={!selectedProduct || saving}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? "Registrando..." : "Registrar compra y agregar stock"}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-white">Historial de compras</h2>
              <span className="text-xs text-gray-400">{purchases.length} compras</span>
            </div>
            {purchases.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Aún no hay compras registradas</div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-700">
                {purchases.slice(0, 50).map((p) => (
                  <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{p.productName}</div>
                      <div className="text-xs text-gray-400">
                        {p.quantity} ud(s) · {p.location} · ${(p.unitCost * p.quantity).toLocaleString()}
                        {p.userName ? ` · ${p.userName}` : ""}
                        {p.notes ? ` · ${p.notes}` : ""}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">${(p.unitCost * p.quantity).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "analisis" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos totales</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400 mt-0.5">${totals.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Costo de mercancía</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">${totals.cogs.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ganancia</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">${totals.profit.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Margen</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                {totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Valor inventario (a costo)</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">${totals.inventoryCost.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Valor inventario (a precio venta)</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">${totals.inventoryValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-800 dark:text-white">Ganancia por producto</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {rows.sort((a, b) => b.revenue - a.revenue).map((r) => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.imageUrl && <img src={r.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{r.name}</div>
                      <div className="text-xs text-gray-400">
                        Venta ${r.price.toLocaleString()} · Costo ${(r.cost || 0).toLocaleString()} · {r.unitsSold} ud(s) vendidas
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold ${r.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        ${r.profit.toLocaleString()}
                      </div>
                      <div className={`text-[10px] font-bold ${r.margin >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {r.margin.toFixed(1)}% margen
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${totals.revenue ? (r.revenue / totals.revenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "historico" && <HistoricoTab purchases={historicalPurchases} sales={historicalSales} />}
    </div>
  );
}

function HistoricoTab({
  purchases,
  sales,
}: {
  purchases: HistoricalPurchase[];
  sales: HistoricalSale[];
}) {
  const [search, setSearch] = useState("");
  const [subTab, setSubTab] = useState<"general" | "compras" | "ventas">("general");

  const q = search.trim().toLowerCase();

  const filteredPurchases = purchases.filter(
    (p) =>
      !q ||
      p.product.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
  );
  const filteredSales = sales.filter(
    (s) =>
      !q ||
      s.product.toLowerCase().includes(q) ||
      s.channel.toLowerCase().includes(q) ||
      s.articleId.toLowerCase().includes(q)
  );

  const totals = useMemo(() => {
    const totalPurchases = purchases.reduce((acc, p) => acc + (p.total || 0), 0);
    const totalPurchaseUnits = purchases.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const grossIncome = sales.reduce((acc, s) => acc + (s.grossIncome || 0), 0);
    const grossProfit = sales.reduce((acc, s) => acc + (s.grossProfit || 0), 0);
    const netProfit = sales.reduce((acc, s) => acc + (s.netProfit || 0), 0);
    const variableExpenses = sales.reduce((acc, s) => acc + (s.variableExpenses || 0), 0);
    const soldUnits = sales.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const costOfSold = sales.reduce((acc, s) => acc + (s.unitCost || 0) * (s.quantity || 0), 0);
    const remainingValue = totalPurchases - costOfSold;
    return { totalPurchases, totalPurchaseUnits, grossIncome, grossProfit, netProfit, variableExpenses, soldUnits, costOfSold, remainingValue };
  }, [purchases, sales]);

  const productSummary = useMemo(() => {
    const map: Record<string, {
      name: string;
      purchasedUnits: number;
      purchaseCost: number;
      soldUnits: number;
      grossIncome: number;
      netProfit: number;
    }> = {};

    for (const p of purchases) {
      const e = map[p.product] || { name: p.product, purchasedUnits: 0, purchaseCost: 0, soldUnits: 0, grossIncome: 0, netProfit: 0 };
      e.purchasedUnits += p.quantity || 0;
      e.purchaseCost += p.total || 0;
      map[p.product] = e;
    }
    for (const s of sales) {
      const e = map[s.product] || { name: s.product, purchasedUnits: 0, purchaseCost: 0, soldUnits: 0, grossIncome: 0, netProfit: 0 };
      e.soldUnits += s.quantity || 0;
      e.grossIncome += s.grossIncome || 0;
      e.netProfit += s.netProfit || 0;
      map[s.product] = e;
    }

    return Object.values(map)
      .filter((e) => e.soldUnits > 0)
      .sort((a, b) => b.grossIncome - a.grossIncome);
  }, [purchases, sales]);

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Datos importados de tu Excel: {purchases.length} compras y {sales.length} ventas
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSubTab("general")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${subTab === "general" ? "bg-amber-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"}`}
        >
          📈 Resumen
        </button>
        <button
          onClick={() => setSubTab("compras")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${subTab === "compras" ? "bg-amber-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"}`}
        >
          🛒 Compras ({purchases.length})
        </button>
        <button
          onClick={() => setSubTab("ventas")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${subTab === "ventas" ? "bg-amber-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"}`}
        >
          💵 Ventas ({sales.length})
        </button>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por producto, canal, proveedor..."
          className={inputClass}
        />
      </div>

      {subTab === "general" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Inversión en compras</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">${totals.totalPurchases.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">{totals.totalPurchaseUnits} unidades compradas</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos brutos</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400 mt-0.5">${totals.grossIncome.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">{totals.soldUnits} unidades vendidas</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Utilidad neta</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">${totals.netProfit.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">Bruta ${totals.grossProfit.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Gastos variables</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-0.5">${totals.variableExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Margen neto</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-0.5">
                {totals.grossIncome > 0 ? Math.round((totals.netProfit / totals.grossIncome) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
            <h2 className="font-semibold text-gray-800 dark:text-white text-sm">Compras vs. ventas</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">
              Cuánto invertiste, cuánto de eso vendiste y cuánto quedó (en stock o pendiente).
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Invertido</p>
                <p className="text-base font-bold text-blue-700 dark:text-blue-400">${totals.totalPurchases.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Costo de lo vendido</p>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400">-${totals.costOfSold.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Queda (stock/mermas)</p>
                <p className="text-base font-bold text-green-600 dark:text-green-400">${totals.remainingValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${totals.totalPurchases ? Math.min(100, (totals.costOfSold / totals.totalPurchases) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {totals.totalPurchases > 0 ? Math.round((totals.costOfSold / totals.totalPurchases) * 100) : 0}% de la inversión ya se vendió
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-800 dark:text-white">Resumen por producto</h2>
              <p className="text-xs text-gray-400 mt-0.5">{productSummary.length} productos con ventas históricas</p>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {productSummary.filter((e) => !q || e.name.toLowerCase().includes(q)).map((e) => (
                <div key={e.name} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{e.name}</div>
                      <div className="text-xs text-gray-400">
                        {e.purchasedUnits} comprados · {e.soldUnits} vendidos · ${e.grossIncome.toLocaleString()} ingresos
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold ${e.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        ${e.netProfit.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {e.grossIncome > 0 ? Math.round((e.netProfit / e.grossIncome) * 100) : 0}% margen
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === "compras" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-white">Compras históricas</h2>
            <span className="text-xs text-gray-400">{filteredPurchases.length} de {purchases.length}</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {filteredPurchases.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{p.product}</div>
                  <div className="text-xs text-gray-400">
                    {p.quantity} ud(s) · ${(p.unitCost || 0).toLocaleString()} c/u
                    {p.supplier ? ` · ${p.supplier}` : ""}
                    {p.order ? ` · Pedido ${p.order}` : ""}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">${(p.total || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400">{formatDate(p.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === "ventas" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-white">Ventas históricas</h2>
            <span className="text-xs text-gray-400">{filteredSales.length} de {sales.length}</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {filteredSales.map((s) => (
              <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-white truncate">{s.product}</div>
                  <div className="text-xs text-gray-400">
                    {s.quantity} ud(s) · {s.channel || "Sin canal"}
                    {s.order ? ` · ${s.order}` : ""}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">${(s.grossIncome || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400">{formatDate(s.date)} · ${(s.netProfit || 0).toLocaleString()} utilidad</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString();
}
