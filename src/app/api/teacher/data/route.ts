import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: "ID de profesor requerido" }, { status: 400 });
    }

    // Verificar que el profesor existe
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Obtener todos los alumnos
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        lastName: true,
        grade: true,
        rut: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      ok: true, 
      subjects: teacher.subjects,
      students: students
    });
  } catch (error) {
    console.error("Error al obtener datos del profesor:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 