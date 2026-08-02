import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) {
    return Response.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return Response.json({ product });
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  try {
    const data = await request.json();

    const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const stockFields: Array<{ field: string; location: string }> = [
      { field: "stockMercadito", location: "Mercadito" },
      { field: "stockBoutique", location: "Boutique" },
      { field: "stockMiravalle", location: "Miravalle" },
      { field: "stockDiamond", location: "Diamond" },
      { field: "stockMorelos", location: "Morelos" },
    ];

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data,
    });

    for (const sf of stockFields) {
      const before = (existing as unknown as Record<string, number>)[sf.field] || 0;
      const after = (product as unknown as Record<string, number>)[sf.field] || 0;
      const delta = after - before;
      if (delta === 0) continue;

      await prisma.movement.create({
        data: {
          productId: product.id,
          userId: session.userId,
          fromLocation: delta > 0 ? "Ajuste externo" : sf.location,
          toLocation: delta > 0 ? sf.location : "Ajuste externo",
          quantity: Math.abs(delta),
          notes: "Ajuste manual de inventario",
        },
      });
    }

    return Response.json({ product });
  } catch (error) {
    return Response.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
