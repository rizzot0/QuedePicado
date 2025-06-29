import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, teacherId } = await req.json();
    
    if (!name || !teacherId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar que el nombre de la asignatura sea único
    const existingSubject = await prisma.subject.findUnique({ where: { name } });
    if (existingSubject) {
      return NextResponse.json({ error: "Ya existe una asignatura con este nombre" }, { status: 400 });
    }

    // Verificar que el profesor existe
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Crear la asignatura
    const subject = await prisma.subject.create({
      data: {
        name,
        teacherId,
      },
      include: {
        teacher: {
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
      subject: {
        id: subject.id,
        name: subject.name,
        teacherName: subject.teacher.user.name,
        teacherEmail: subject.teacher.user.email,
      }
    });
  } catch (error) {
    console.error("Error al crear asignatura:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Obtener todas las asignaturas con información del profesor
    const subjects = await prisma.subject.findMany({
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        grades: {
          select: {
            id: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      ok: true, 
      subjects: subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        teacherName: subject.teacher.user.name,
        teacherEmail: subject.teacher.user.email,
        gradeCount: subject.grades.length,
      }))
    });
  } catch (error) {
    console.error("Error al obtener asignaturas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 