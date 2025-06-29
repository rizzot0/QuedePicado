import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, lastName, rut, grade, userId } = await req.json();
    
    if (!name || !lastName || !rut || !grade || !userId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar que el RUT sea único
    const existingStudent = await prisma.student.findUnique({ where: { rut } });
    if (existingStudent) {
      return NextResponse.json({ error: "Ya existe un alumno con este RUT" }, { status: 400 });
    }

    // Obtener el ID del apoderado
    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      return NextResponse.json({ error: "Apoderado no encontrado" }, { status: 404 });
    }

    // Crear el alumno
    const student = await prisma.student.create({
      data: {
        name,
        lastName,
        rut,
        grade,
        parentId: parent.id,
      },
    });

    return NextResponse.json({ 
      ok: true, 
      student: {
        id: student.id,
        name: student.name,
        lastName: student.lastName,
        rut: student.rut,
        grade: student.grade,
      }
    });
  } catch (error) {
    console.error("Error al crear alumno:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    // Obtener el ID del apoderado
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        students: {
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!parent) {
      return NextResponse.json({ error: "Apoderado no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      students: parent.students 
    });
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 