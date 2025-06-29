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

export default function ParentGradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [subjectAverages, setSubjectAverages] = useState<SubjectAverage[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "PARENT") {
      router.push("/login");
    } else if (session?.user) {
      loadStudents();
    }
  }, [session, status, router]);

  const loadStudents = async () => {
    try {
      // Obtener el ID del apoderado
      const parentRes = await fetch(`/api/admin/parents`);
      const parentData = await parentRes.json();
      
      if (parentData.ok) {
        const parent = parentData.parents.find((p: any) => 
          p.email === (session?.user as any).email
        );
        
        if (parent) {
          // Obtener alumnos del apoderado
          const studentsRes = await fetch(`/api/admin/students`);
          const studentsData = await studentsRes.json();
          
          if (studentsData.ok) {
            const parentStudents = studentsData.students.filter((s: any) => 
              s.parentId === parent.id
            );
            setStudents(parentStudents);
            
            if (parentStudents.length > 0) {
              setSelectedStudent(parentStudents[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async (studentId: string) => {
    try {
      const res = await fetch(`/api/grades?studentId=${studentId}`);
      const data = await res.json();
      
      if (data.ok) {
        setGrades(data.grades);
        calculateSubjectAverages(data.grades);
      }
    } catch (error) {
      console.error("Error al cargar notas:", error);
    }
  };

  const calculateSubjectAverages = (studentGrades: Grade[]) => {
    const subjectMap = new Map<string, { total: number; count: number }>();
    
    studentGrades.forEach(grade => {
      const current = subjectMap.get(grade.subjectName) || { total: 0, count: 0 };
      current.total += grade.value;
      current.count += 1;
      subjectMap.set(grade.subjectName, current);
    });
    
    const averages = Array.from(subjectMap.entries()).map(([subjectName, data]) => ({
      subjectName,
      average: data.total / data.count,
      totalGrades: data.count
    }));
    
    setSubjectAverages(averages);
  };

  useEffect(() => {
    if (selectedStudent) {
      loadGrades(selectedStudent);
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notas de Mis Alumnos</h1>
        <button
          onClick={() => router.push("/parent/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Dashboard
        </button>
      </div>

      {students.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No tienes alumnos asociados.</p>
        </div>
      ) : (
        <>
          {/* Selector de alumno */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <label className="block mb-2 font-medium">Seleccionar Alumno</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.lastName} - {student.grade}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Promedios por asignatura */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Promedios por Asignatura</h2>
                {subjectAverages.length === 0 ? (
                  <p className="text-gray-500">No hay notas registradas aún.</p>
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

              {/* Lista de notas */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Todas las Notas</h2>
                {grades.length === 0 ? (
                  <p className="text-gray-500">No hay notas registradas aún.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {grades.map((grade) => (
                      <div key={grade.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{grade.subjectName}</h3>
                            <p className="text-sm text-gray-500">
                              {getTypeLabel(grade.type)} • {new Date(grade.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded text-lg font-bold ${getGradeColor(grade.value)}`}>
                            {grade.value.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 