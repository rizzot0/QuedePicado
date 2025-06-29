import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Obtener todos los profesores con información básica
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        subjects: {
          select: {
            id: true,
            name: true,
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
      teachers: teachers.map(teacher => ({
        id: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        subjectCount: teacher.subjects.length,
        subjects: teacher.subjects,
      }))
    });
  } catch (error) {
    console.error("Error al obtener profesores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 