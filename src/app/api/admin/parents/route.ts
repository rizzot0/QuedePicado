import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Obtener todos los apoderados con información básica
    const parents = await prisma.parent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        students: {
          select: {
            id: true,
            name: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      parents: parents.map(parent => ({
        id: parent.id,
        name: parent.user.name,
        email: parent.user.email,
        studentCount: parent.students.length,
        students: parent.students,
      }))
    });
  } catch (error) {
    console.error("Error al obtener apoderados:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 