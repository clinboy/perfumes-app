"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  totalSales: number;
  totalRevenue: number;
  totalMovements: number;
}

interface Activity {
  id: number;
  productName: string;
  quantity: number;
  price?: number;
  location?: string;
  from?: string;
  to?: string;
  userName?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [recentSales, setRecentSales] = useState<Activity[]>([]);
  const [recentMovements, setRecentMovements] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"usuarios" | "ventas" | "movimientos">("usuarios");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setRecentSales(data.recentSales || []);
        setRecentMovements(data.recentMovements || []);
      })
      .finally(() => setLoading(false));
  }, []);

  function formatDate(d: string) {
    const date = new Date(d);
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Panel de Administración</h1>

      <div className="flex gap-2">
        {(["usuarios", "ventas", "movimientos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              tab === t
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-amber-300"
            }`}
          >
            {t === "usuarios" ? "👤 Usuarios" : t === "ventas" ? "💰 Ventas" : "📋 Movimientos"}
          </button>
        ))}
      </div>

      {tab === "usuarios" && (
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay usuarios registrados</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === "admin" ? "bg-amber-600" : "bg-slate-500"}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        {u.name}
                        {u.role === "admin" && <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Admin</span>}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{u.phone} · Registrado {formatDate(u.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg py-2">
                    <div className="text-lg font-bold text-green-700 dark:text-green-400">{u.totalSales}</div>
                    <div className="text-[10px] text-green-600 dark:text-green-500">Ventas</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg py-2">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-400">${u.totalRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-500">Ingresos</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg py-2">
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{u.totalMovements}</div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-500">Movimientos</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "ventas" && (
        <div className="space-y-2">
          {recentSales.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay ventas registradas</p>
          ) : (
            recentSales.map((s) => (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-3 flex items-center justify-between transition-colors">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{s.productName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {s.userName || "Desconocido"} · {s.location} · {s.quantity} uds
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 dark:text-green-400 text-sm">${(Number(s.price) * s.quantity).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(s.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "movimientos" && (
        <div className="space-y-2">
          {recentMovements.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay movimientos registrados</p>
          ) : (
            recentMovements.map((m) => (
              <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-3 flex items-center justify-between transition-colors">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{m.productName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {m.userName || "Desconocido"} · {m.from} → {m.to} · {m.quantity} uds
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(m.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
