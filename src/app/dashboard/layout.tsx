"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "📊" },
  { href: "/dashboard/productos", label: "Productos", icon: "🧴" },
  { href: "/dashboard/importar", label: "Importar Excel", icon: "📥" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-amber-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Logo%20Perfumatic.png" alt="Perfumatic" className="h-10" />
            <Link href="/dashboard" className="text-xl font-bold">Perfumatic</Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    ? "text-amber-200"
                    : "text-white hover:text-amber-200"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-sm bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded transition"
            >
              Salir
            </button>
          </nav>

          <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden px-4 pb-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-medium ${
                  pathname === item.href ? "text-amber-200" : "text-white"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="block text-sm text-white bg-amber-600 px-3 py-1 rounded">
              Salir
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
