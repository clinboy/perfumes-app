import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perfumatic - Inventario",
  description: "Sistema de inventario para vendedores",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-200 antialiased transition-colors">{children}</body>
    </html>
  );
}
