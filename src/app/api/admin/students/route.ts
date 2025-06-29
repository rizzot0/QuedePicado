import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, lastName, rut, grade, parentId } = await req.json();
    
    if (!name || !lastName || !rut || !grade || !parentId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar que el RUT sea único
    const existingStudent = await prisma.student.findUnique({ where: { rut } });
    if (existingStudent) {
      return NextResponse.json({ error: "Ya existe un alumno con este RUT" }, { status: 400 });
    }

    // Verificar que el apoderado existe
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
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
        parentId,
      },
      include: {
        parent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      student: {
        id: student.id,
        name: student.name,
        lastName: student.lastName,
        rut: student.rut,
        grade: student.grade,
        parentName: student.parent.user.name,
        parentEmail: student.parent.user.email,
      }
    });
  } catch (error) {
    console.error("Error al crear alumno:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Obtener todos los alumnos con información del apoderado
    const students = await prisma.student.findMany({
      include: {
        parent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      ok: true, 
      students: students.map(student => ({
        id: student.id,
        name: student.name,
        lastName: student.lastName,
        rut: student.rut,
        grade: student.grade,
        parentName: student.parent.user.name,
        parentEmail: student.parent.user.email,
      }))
    });
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 