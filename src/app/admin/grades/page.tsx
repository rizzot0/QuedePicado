"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  lastName: string;
  grade: string;
  rut: string;
  parentName: string;
}

interface Grade {
  id: string;
  value: number;
  type: string;
  date: string;
  studentName: string;
  subjectName: string;
}

interface SubjectAverage {
  subjectName: string;
  average: number;
  totalGrades: number;
}

export default function AdminGradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [subjectAverages, setSubjectAverages] = useState<SubjectAverage[]>([]);
  const [generalStats, setGeneralStats] = useState({
    totalStudents: 0,
    totalGrades: 0,
    generalAverage: 0,
    passingRate: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "ADMIN") {
      router.push("/login");
    } else if (session?.user) {
      loadData();
    }
  }, [session, status, router]);

  const loadData = async () => {
    try {
      // Cargar alumnos
      const studentsRes = await fetch("/api/admin/students");
      const studentsData = await studentsRes.json();
      
      if (studentsData.ok) {
        setStudents(studentsData.students);
        setGeneralStats(prev => ({ ...prev, totalStudents: studentsData.students.length }));
      }

      // Cargar todas las notas
      const gradesRes = await fetch("/api/grades");
      const gradesData = await gradesRes.json();
      
      if (gradesData.ok) {
        setGrades(gradesData.grades);
        calculateGeneralStats(gradesData.grades);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGeneralStats = (allGrades: Grade[]) => {
    const totalGrades = allGrades.length;
    const generalAverage = totalGrades > 0 
      ? allGrades.reduce((sum, grade) => sum + grade.value, 0) / totalGrades 
      : 0;
    
    const passingGrades = allGrades.filter(grade => grade.value >= 4.0).length;
    const passingRate = totalGrades > 0 ? (passingGrades / totalGrades) * 100 : 0;

    setGeneralStats({
      totalStudents: students.length,
      totalGrades,
      generalAverage,
      passingRate,
    });
  };

  const loadStudentAverages = async (studentId: string) => {
    try {
      const res = await fetch(`/api/grades/averages?studentId=${studentId}`);
      const data = await res.json();
      
      if (data.ok) {
        setSubjectAverages(data.subjectAverages);
      }
    } catch (error) {
      console.error("Error al cargar promedios:", error);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      loadStudentAverages(selectedStudent);
    }
  }, [selectedStudent]);

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      CONTROL: "Control",
      PRUEBA: "Prueba",
      EXAMEN: "Examen",
      TRABAJO: "Trabajo",
      OTRO: "Otro"
    };
    return types[type] || type;
  };

  const getGradeColor = (value: number) => {
    if (value >= 6.0) return "bg-green-100 text-green-800";
    if (value >= 4.0) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reporte de Notas</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Alumnos</h3>
          <p className="text-2xl font-bold text-blue-600">{generalStats.totalStudents}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Total Notas</h3>
          <p className="text-2xl font-bold text-green-600">{generalStats.totalGrades}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Promedio General</h3>
          <p className="text-2xl font-bold text-yellow-600">{generalStats.generalAverage.toFixed(1)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">% Aprobación</h3>
          <p className="text-2xl font-bold text-purple-600">{generalStats.passingRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de alumno */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Seleccionar Alumno</h2>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccionar alumno</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} {student.lastName} - {student.grade}
              </option>
            ))}
          </select>
        </div>

        {/* Promedios del alumno seleccionado */}
        {selectedStudent && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Promedios del Alumno</h2>
            {subjectAverages.length === 0 ? (
              <p className="text-gray-500">No hay notas registradas para este alumno.</p>
            ) : (
              <div className="space-y-3">
                {subjectAverages.map((subject, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <h3 className="font-semibold">{subject.subjectName}</h3>
                      <p className="text-sm text-gray-500">
                        {subject.totalGrades} nota{subject.totalGrades !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded font-bold text-lg ${getGradeColor(subject.average)}`}>
                      {subject.average.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Últimas notas registradas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Últimas Notas Registradas</h2>
          {grades.length === 0 ? (
            <p className="text-gray-500">No hay notas registradas aún.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {grades.slice(0, 10).map((grade) => (
                <div key={grade.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm">{grade.studentName}</h3>
                      <p className="text-xs text-gray-600">{grade.subjectName}</p>
                      <p className="text-xs text-gray-500">
                        {getTypeLabel(grade.type)} • {new Date(grade.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(grade.value)}`}>
                      {grade.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 