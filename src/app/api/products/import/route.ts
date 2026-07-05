import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    let imported = 0;
    for (const row of rows) {
      const name = (row["nombre"] || row["Nombre"] || row["NAME"] || row["name"] || "") as string;
      if (!name) continue;

      const product = {
        name,
        description: (row["descripcion"] || row["Descripcion"] || row["DESCRIPTION"] || row["description"] || "") as string,
        price: parseFloat(String(row["precio"] || row["Precio"] || row["PRICE"] || row["price"] || 0)),
        stock: parseInt(String(row["stock"] || row["Stock"] || row["STOCK"] || 0)),
        category: (row["categoria"] || row["Categoria"] || row["CATEGORY"] || row["category"] || "") as string,
        barcode: (row["codigo"] || row["Codigo"] || row["BARCODE"] || row["barcode"] || "") as string,
      };

      await prisma.product.create({ data: product });
      imported++;
    }

    return Response.json({ imported });
  } catch (error) {
    return Response.json({ error: "Error al importar archivo" }, { status: 500 });
  }
}
