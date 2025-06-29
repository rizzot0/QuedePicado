import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (role !== "TEACHER" && role !== "PARENT") {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }

    // Verificar que el email sea único
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 400 });
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el usuario y su perfil correspondiente
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        teacher: role === "TEACHER" ? { create: {} } : undefined,
        parent: role === "PARENT" ? { create: {} } : undefined,
      },
      include: {
        teacher: true,
        parent: true,
      }
    });

    return NextResponse.json({ 
      ok: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Obtener todos los usuarios excepto administradores
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["TEACHER", "PARENT"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
          }
        },
        parent: {
          select: {
            id: true,
            students: {
              select: {
                id: true,
                name: true,
                lastName: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      ok: true, 
      users 
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 