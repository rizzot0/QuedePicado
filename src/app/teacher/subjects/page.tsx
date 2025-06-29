"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
  description?: string;
}

export default function TeacherSubjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "TEACHER") {
      router.push("/login");
    } else if (session?.user) {
      loadSubjects();
    }
  }, [session, status, router]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      // Obtener el ID del profesor
      const teacherRes = await fetch(`/api/admin/teachers`);
      const teacherData = await teacherRes.json();
      
      if (teacherData.ok) {
        const teacher = teacherData.teachers.find((t: any) => 
          t.email === (session?.user as any).email
        );
        
        if (teacher) {
          // Obtener asignaturas del profesor
          const dataRes = await fetch(`/api/teacher/data?teacherId=${teacher.id}`);
          const data = await dataRes.json();
          
          if (data.ok) {
            setSubjects(data.subjects);
          } else {
            setError("Error al cargar las asignaturas");
          }
        } else {
          setError("No se encontró el perfil del profesor");
        }
      } else {
        setError("Error al obtener datos del profesor");
      }
    } catch (error) {
      console.error("Error al cargar asignaturas:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Asignaturas</h1>
        <button
          onClick={() => router.push("/teacher/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Asignaturas Asignadas</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {subjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-2">No tienes asignaturas asignadas</p>
            <p className="text-gray-400">Contacta al administrador para que te asigne asignaturas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 text-lg mb-2">{subject.name}</h3>
                {subject.description && (
                  <p className="text-blue-600 text-sm">{subject.description}</p>
                )}
                <div className="mt-3">
                  <button
                    onClick={() => router.push(`/teacher/grades?subjectId=${subject.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Ingresar Notas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Información</h3>
          <p className="text-gray-600 text-sm">
            Aquí puedes ver todas las asignaturas que tienes asignadas. 
            Haz clic en "Ingresar Notas" para registrar las calificaciones de tus alumnos.
          </p>
        </div>
      </div>
    </div>
  );
} 