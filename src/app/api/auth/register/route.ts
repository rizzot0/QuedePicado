import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    if (role !== "PARENT" && role !== "TEACHER") {
      return NextResponse.json({ error: "Rol no permitido" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        parent: role === "PARENT" ? { create: {} } : undefined,
        teacher: role === "TEACHER" ? { create: {} } : undefined,
      },
    });
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Error en el registro" }, { status: 500 });
  }
} 