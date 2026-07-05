import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return Response.json({ error: "Teléfono y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    return Response.json({
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    return Response.json({ error: "Error del servidor" }, { status: 500 });
  }
}
