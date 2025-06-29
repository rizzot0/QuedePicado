"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "TEACHER") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard del Profesor</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {session.user?.name}</h2>
        <p className="text-gray-600">Aquí podrás gestionar las notas de tus alumnos.</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
               onClick={() => router.push("/teacher/subjects")}>
            <h3 className="font-semibold text-blue-800">Asignaturas</h3>
            <p className="text-blue-600">Ver tus asignaturas asignadas</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
               onClick={() => router.push("/teacher/grades")}>
            <h3 className="font-semibold text-green-800">Ingresar Notas</h3>
            <p className="text-green-600">Registrar notas de alumnos</p>
          </div>
        </div>
      </div>
    </div>
  );
} 