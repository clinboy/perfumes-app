"use client";

import { useState, useRef } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al importar");
        return;
      }

      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Importar desde Excel</h1>
      <p className="text-gray-500 mb-6">
        Sube un archivo Excel (.xlsx o .xls) con las columnas: nombre, precio, stock, categoria, codigo, descripcion
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500 transition"
          onClick={() => inputRef.current?.click()}
        >
          {file ? (
            <div>
              <p className="text-lg font-medium text-amber-700">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-4xl mb-2">📁</p>
              <p className="text-gray-500">Haz clic para seleccionar un archivo Excel</p>
              <p className="text-sm text-gray-400 mt-1">.xlsx o .xls</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium mb-1">Columnas reconocidas:</p>
          <p>nombre, descripcion, precio, stock, categoria, codigo</p>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            ¡Importación exitosa! {result.imported} productos importados.
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Importando..." : "Importar"}
        </button>
      </form>
    </div>
  );
}
