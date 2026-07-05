import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password } = await request.json();

    if (!name || !phone || !password) {
      return Response.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return Response.json({ error: "El teléfono ya está registrado" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, phone, password: hashed },
    });

    return Response.json({
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    return Response.json({ error: "Error del servidor" }, { status: 500 });
  }
}
