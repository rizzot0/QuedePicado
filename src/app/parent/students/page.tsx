"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  lastName: string;
  rut: string;
  grade: string;
}

export default function StudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch(`/api/students?userId=${(session?.user as any).id}`);
      const data = await res.json();
      if (data.ok) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
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
        <h1 className="text-3xl font-bold">Mis Alumnos</h1>
        <button
          onClick={() => router.push("/parent/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Alumnos Asociados</h2>
        <p className="text-gray-600 mb-6">
          Aquí puedes ver la información de los alumnos que tienes asociados. 
          Para agregar nuevos alumnos, contacta al administrador del sistema.
        </p>
        
        {students.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes alumnos asociados aún.</p>
            <p className="text-sm text-gray-400">
              El administrador debe asociar alumnos a tu cuenta.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{student.name} {student.lastName}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>RUT:</strong> {student.rut}</p>
                  <p><strong>Curso:</strong> {student.grade}</p>
                </div>
                <button
                  onClick={() => router.push(`/parent/students/${student.id}/grades`)}
                  className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Ver Notas
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 