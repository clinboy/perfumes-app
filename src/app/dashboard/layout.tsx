"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/lib/theme";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { dark, toggle } = useTheme();

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: "📊" },
    { href: "/dashboard/productos", label: "Productos", icon: "🧴" },
    { href: "/dashboard/ventas", label: "Ventas", icon: "💰" },
    { href: "/dashboard/movimientos", label: "Movimientos", icon: "📋" },
    { href: "/dashboard/favoritos", label: "Favoritos", icon: "⭐" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      <header className="bg-amber-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/Logo%20Perfumatic.png" alt="Perfumatic" className="h-10 drop-shadow-sm" />
            <span className="text-xl font-bold tracking-tight">Perfumatic</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
            <button
              onClick={toggle}
              className="ml-1 p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
              title={dark ? "Modo claro" : "Modo oscuro"}
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={handleLogout}
              className="ml-1 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Salir
            </button>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggle}
              className="text-xl p-2"
              title={dark ? "Modo claro" : "Modo oscuro"}
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              className="text-2xl p-2 -mr-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden px-4 pb-4 animate-slide-down">
            {navItems.map((item) => {
              const active = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition ${
                    active ? "bg-white/20 text-white" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="block w-full text-left py-2.5 px-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition"
            >
              🚪 Salir
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-50 bottom-nav transition-colors">
        <div className="flex items-center justify-around py-2 px-1">
          {[
            { href: "/dashboard", label: "Inicio", icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
              </svg>
            )},
            { href: "/dashboard/productos", label: "Productos", icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )},
            { href: "/dashboard/productos/nuevo", label: "Nuevo", icon: (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            ), highlight: true },
            { href: "/dashboard/ventas", label: "Ventas", icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
          ].map((item) => {
            const active = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href === "/dashboard/productos/nuevo"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`bottom-nav-item ${active ? "active" : ""} flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-200 ${
                  item.highlight && !active
                    ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 -mt-4 px-4 py-3 rounded-full shadow-lg"
                    : ""
                }`}
              >
                {item.highlight ? (
                  <div className="bg-amber-600 text-white p-3 rounded-full shadow-lg -mt-5 border-4 border-gray-50 dark:border-slate-900">
                    {item.icon}
                  </div>
                ) : (
                  <span className={`transition-colors ${active ? "text-amber-600" : "text-gray-400 dark:text-slate-400"}`}>
                    {item.icon}
                  </span>
                )}
                <span className={`text-[10px] font-medium ${item.highlight ? "text-amber-700 dark:text-amber-300 mt-1" : active ? "text-amber-600" : "text-gray-400 dark:text-slate-400"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardInner>{children}</DashboardInner>
    </ThemeProvider>
  );
}
