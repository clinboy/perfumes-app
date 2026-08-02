"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
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
  clientName: string;
  imageUrl: string | null;
  userName: string;
  createdAt: string;
}

const LOCATIONS = ["Mercadito", "Boutique", "Miravalle", "Diamond", "Morelos"];

export default function VentasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [location, setLocation] = useState("Mercadito");
  const [quantity, setQuantity] = useState("1");
  const [paymentType, setPaymentType] = useState<"contado" | "pagos">("contado");
  const [downPayment, setDownPayment] = useState("");
  const [clientName, setClientName] = useState("");
  const [selling, setSelling] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payError, setPayError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [p, s] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/sales").then((r) => r.json()),
    ]);
    setProducts(p.products || []);
    setSales(s.sales || []);
    setLoading(false);
  }

  const availableStock = selectedProduct
    ? (selectedProduct as unknown as Record<string, number>)[`stock${location}`] || 0
    : 0;

  async function handleSale() {
    if (!selectedProduct) return;
    setSelling(true);
    try {
      const total = selectedProduct.price * (parseInt(quantity) || 1);
      await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseInt(quantity) || 1,
          price: selectedProduct.price,
          location,
          paymentType,
          amountPaid: paymentType === "pagos" ? parseFloat(downPayment) || 0 : total,
          clientName,
        }),
      });
      await loadData();
      setShowForm(false);
      setSelectedProduct(null);
      setQuantity("1");
      setDownPayment("");
      setClientName("");
      setPaymentType("contado");
    } finally {
      setSelling(false);
    }
  }

  async function handlePayment(sale: Sale) {
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) {
      setPayError("Ingresa un monto válido");
      return;
    }
    setPayError("");
    try {
      await fetch(`/api/sales/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      await loadData();
      setPayingId(null);
      setPayAmount("");
    } catch {
      setPayError("Error al registrar el pago");
    }
  }

  const todaySales = sales.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const todayTotal = todaySales.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const pendingApartados = sales.filter((s) => s.paymentType === "pagos" && s.amountPaid < s.price * s.quantity);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ventas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hoy: {todaySales.length} ventas — ${todayTotal.toLocaleString()}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
        >
          + Vender
        </button>
      </div>

      {pendingApartados.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⏳</span>
            <h2 className="font-semibold text-amber-800 dark:text-amber-300">Apartados por cobrar</h2>
            <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
              {pendingApartados.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingApartados.slice(0, 5).map((s) => {
              const total = s.price * s.quantity;
              const remaining = Math.max(total - s.amountPaid, 0);
              return (
                <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {s.clientName ? `${s.clientName} — ` : ""}{s.productName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {s.location} · Debe <span className="text-amber-600 dark:text-amber-400 font-bold">${remaining.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setPayingId(s.id); setPayAmount(""); setPayError(""); }}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium flex-shrink-0 ml-2"
                  >
                    + Pago
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4 animate-slide-up">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Producto</label>
            <select
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const p = products.find((x) => x.id === parseInt(e.target.value));
                setSelectedProduct(p || null);
              }}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white"
            >
              <option value="">Seleccionar...</option>
              {products.filter(p => p.totalStock > 0).map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sucursal</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Cantidad (disponible: {availableStock})</label>
              <input
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tipo de pago</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("contado")}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  paymentType === "contado"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-green-300"
                }`}
              >
                ✅ Contado
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("pagos")}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  paymentType === "pagos"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-amber-300"
                }`}
              >
                📅 Apartado / Pagos
              </button>
            </div>
          </div>

          {paymentType === "pagos" && (
            <div className="grid grid-cols-2 gap-3 animate-slide-up">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Adelanto</label>
                <input
                  type="number"
                  min="0"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="$0"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Nombre del cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total: </span>
              <span className="font-bold text-gray-800 dark:text-white">${(selectedProduct.price * (parseInt(quantity) || 1)).toLocaleString()}</span>
              {paymentType === "pagos" && (parseFloat(downPayment) || 0) > 0 && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 mx-2">·</span>
                  <span className="text-gray-500 dark:text-gray-400">Queda: </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    ${(selectedProduct.price * (parseInt(quantity) || 1) - (parseFloat(downPayment) || 0)).toLocaleString()}
                  </span>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleSale}
            disabled={!selectedProduct || selling || parseInt(quantity) > availableStock || (paymentType === "pagos" && (parseFloat(downPayment) || 0) > (selectedProduct?.price || 0) * (parseInt(quantity) || 1))}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {selling ? "Procesando..." : paymentType === "pagos" ? "Registrar apartado" : "Registrar venta"}
          </button>
        </div>
      )}

      {payingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPayingId(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 dark:text-white mb-3">Registrar pago</h3>
            {(() => {
              const sale = sales.find((s) => s.id === payingId);
              if (!sale) return null;
              const total = sale.price * sale.quantity;
              const remaining = Math.max(total - sale.amountPaid, 0);
              return (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {sale.clientName ? `${sale.clientName} — ` : ""}{sale.productName}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">Debe: <span className="font-bold text-amber-600 dark:text-amber-400">${remaining.toLocaleString()}</span></p>
                  <input
                    type="number"
                    min="0"
                    max={remaining}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Monto del pago"
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 dark:text-white mb-2"
                  />
                  {payError && <p className="text-xs text-red-500 mb-2">{payError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePayment(sale)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-sm font-medium"
                    >
                      Registrar
                    </button>
                    <button
                      onClick={() => setPayingId(null)}
                      className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-2.5 px-4 rounded-xl text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">Historial de ventas</h2>
        </div>
        {sales.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin ventas registradas</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {sales.slice(0, 50).map((s) => {
              const total = s.price * s.quantity;
              const isApartado = s.paymentType === "pagos";
              const isPaid = !isApartado || s.amountPaid >= total;
              const remaining = Math.max(total - s.amountPaid, 0);
              const pct = isPaid ? 100 : Math.min(Math.round((s.amountPaid / total) * 100), 100);
              return (
                <div key={s.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.imageUrl && <img src={s.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {s.clientName ? `${s.clientName} — ` : ""}{s.productName}
                      </div>
                      <div className="text-xs text-gray-400">{s.location} · {s.quantity} ud{s.quantity > 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className={`text-sm font-bold ${isPaid ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                        ${total.toLocaleString()}
                      </div>
                      {isApartado && (
                        isPaid ? (
                          <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Pagado</span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            ${remaining.toLocaleString()} restante
                          </span>
                        )
                      )}
                      {!isApartado && (
                        <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Contado</span>
                      )}
                    </div>
                  </div>
                  {isApartado && !isPaid && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">${s.amountPaid.toLocaleString()}/${total.toLocaleString()}</span>
                      <button
                        onClick={() => { setPayingId(s.id); setPayAmount(""); setPayError(""); }}
                        className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg font-medium"
                      >
                        + Pago
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
