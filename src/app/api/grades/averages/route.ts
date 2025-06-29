import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: "ID de alumno requerido" }, { status: 400 });
    }

    // Verificar que el alumno existe
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    // Obtener todas las notas del alumno
    const grades = await prisma.grade.findMany({
      where: { studentId },
      include: {
        subject: {
          select: {
            name: true,
          }
        }
      }
    });

    // Calcular promedios por asignatura
    const subjectAverages = new Map<string, { total: number; count: number }>();
    
    grades.forEach(grade => {
      const subjectName = grade.subject.name;
      const current = subjectAverages.get(subjectName) || { total: 0, count: 0 };
      current.total += grade.value;
      current.count += 1;
      subjectAverages.set(subjectName, current);
    });

    const averages = Array.from(subjectAverages.entries()).map(([subjectName, data]) => ({
      subjectName,
      average: data.total / data.count,
      totalGrades: data.count,
    }));

    // Calcular promedio general
    const totalGrades = grades.length;
    const generalAverage = totalGrades > 0 
      ? grades.reduce((sum, grade) => sum + grade.value, 0) / totalGrades 
      : 0;

    return NextResponse.json({ 
      ok: true, 
      student: {
        name: student.name,
        lastName: student.lastName,
        grade: student.grade,
      },
      subjectAverages: averages,
      generalAverage: generalAverage,
      totalGrades: totalGrades,
    });
  } catch (error) {
    console.error("Error al calcular promedios:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 