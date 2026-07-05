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
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data,
    });
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
