import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { value, type, studentId, subjectId } = await req.json();
    
    if (!value || !type || !studentId || !subjectId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Validar que la nota esté entre 1.0 y 7.0
    if (value < 1.0 || value > 7.0) {
      return NextResponse.json({ error: "La nota debe estar entre 1.0 y 7.0" }, { status: 400 });
    }

    // Verificar que el alumno existe
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    // Verificar que la asignatura existe
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: "Asignatura no encontrada" }, { status: 404 });
    }

    // Crear la nota
    const grade = await prisma.grade.create({
      data: {
        value,
        type,
        studentId,
        subjectId,
      },
      include: {
        student: {
          select: {
            name: true,
            lastName: true,
          }
        },
        subject: {
          select: {
            name: true,
          }
        }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      grade: {
        id: grade.id,
        value: grade.value,
        type: grade.type,
        date: grade.date,
        studentName: `${grade.student.name} ${grade.student.lastName}`,
        subjectName: grade.subject.name,
      }
    });
  } catch (error) {
    console.error("Error al crear nota:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');

    let whereClause: any = {};
    
    if (studentId) {
      whereClause.studentId = studentId;
    }
    
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    // Obtener notas con información del alumno y asignatura
    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            lastName: true,
            grade: true,
          }
        },
        subject: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calcular promedios si se especifica un alumno y asignatura
    let averages = null;
    if (studentId && subjectId) {
      const subjectGrades = grades.filter(g => g.subjectId === subjectId);
      if (subjectGrades.length > 0) {
        const total = subjectGrades.reduce((sum, grade) => sum + grade.value, 0);
        averages = {
          subjectAverage: total / subjectGrades.length,
          totalGrades: subjectGrades.length,
        };
      }
    }

    return NextResponse.json({ 
      ok: true, 
      grades: grades.map(grade => ({
        id: grade.id,
        value: grade.value,
        type: grade.type,
        date: grade.date,
        studentName: `${grade.student.name} ${grade.student.lastName}`,
        studentGrade: grade.student.grade,
        subjectName: grade.subject.name,
      })),
      averages
    });
  } catch (error) {
    console.error("Error al obtener notas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 