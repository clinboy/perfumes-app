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

const AVATAR_COLORS = [
  "bg-amber-500",
  "bg-rose-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function Avatar({ user }: { user: User }) {
  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`w-12 h-12 rounded-full ${avatarColor(user.id)} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
      {initials || user.name.charAt(0).toUpperCase()}
    </div>
  );
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

  const totalSales = users.reduce((acc, u) => acc + u.totalSales, 0);
  const totalRevenue = users.reduce((acc, u) => acc + u.totalRevenue, 0);
  const totalMovements = users.reduce((acc, u) => acc + u.totalMovements, 0);

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

  const tabs = [
    { id: "usuarios" as const, label: "👤 Usuarios", count: users.length },
    { id: "ventas" as const, label: "💰 Ventas", count: recentSales.length },
    { id: "movimientos" as const, label: "📋 Movimientos", count: recentMovements.length },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Equipo</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Quiénes usan Perfumatic y qué han hecho</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-xs opacity-90">Miembros</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-2xl font-bold">{totalSales}</div>
          <div className="text-xs opacity-90">Ventas totales</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <div className="text-xs opacity-90">Ingresos totales</div>
        </div>
      </div>

      <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 border border-gray-100 dark:border-slate-700 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? "bg-amber-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "usuarios" && (
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aún no hay miembros registrados</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 transition-colors hover:shadow-md">
                <div className="flex items-center gap-3">
                  <Avatar user={u} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 truncate">
                      {u.name}
                      {u.role === "admin" && (
                        <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full flex-shrink-0">
                          👑 Admin
                        </span>
                      )}
                      {u.role !== "admin" && (
                        <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex-shrink-0">
                          🧑‍💼 Vendedor
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">📱 {u.phone} · {formatDate(u.createdAt)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl py-2.5 text-center">
                    <div className="text-lg font-bold text-green-700 dark:text-green-400">{u.totalSales}</div>
                    <div className="text-[10px] text-green-600 dark:text-green-500 font-medium">🛒 Ventas</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl py-2.5 text-center">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-400">${u.totalRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-500 font-medium">💵 Ingresos</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl py-2.5 text-center">
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{u.totalMovements}</div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-500 font-medium">📦 Traslados</div>
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
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aún no hay ventas registradas</p>
          ) : (
            recentSales.map((s) => (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-3 flex items-center justify-between transition-colors hover:shadow-md">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm truncate">🧴 {s.productName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {s.userName || "Desconocido"} · 📍 {s.location} · {s.quantity} uds
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
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
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aún no hay movimientos registrados</p>
          ) : (
            recentMovements.map((m) => (
              <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-3 flex items-center justify-between transition-colors hover:shadow-md">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm truncate">🧴 {m.productName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {m.userName || "Desconocido"} · {m.from} → {m.to} · {m.quantity} uds
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-3">{formatDate(m.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
