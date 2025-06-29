"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "ADMIN") {
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {session.user?.name}</h2>
        <p className="text-gray-600 mb-6">Desde aquí puedes gestionar todo el sistema escolar.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="bg-blue-50 p-6 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => router.push("/admin/users")}
          >
            <h3 className="font-semibold text-blue-800 text-lg mb-2">Gestión de Usuarios</h3>
            <p className="text-blue-600">Crear y gestionar profesores y apoderados</p>
          </div>
          
          <div 
            className="bg-green-50 p-6 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => router.push("/admin/students")}
          >
            <h3 className="font-semibold text-green-800 text-lg mb-2">Gestión de Alumnos</h3>
            <p className="text-green-600">Registrar alumnos y asociarlos a apoderados</p>
          </div>
          
          <div 
            className="bg-purple-50 p-6 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => router.push("/admin/subjects")}
          >
            <h3 className="font-semibold text-purple-800 text-lg mb-2">Gestión de Asignaturas</h3>
            <p className="text-purple-600">Crear asignaturas y asignarlas a profesores</p>
          </div>
          
          <div 
            className="bg-yellow-50 p-6 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => router.push("/admin/grades")}
          >
            <h3 className="font-semibold text-yellow-800 text-lg mb-2">Reporte de Notas</h3>
            <p className="text-yellow-600">Ver reportes y estadísticas de notas</p>
          </div>
          
          <div 
            className="bg-orange-50 p-6 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
            onClick={() => router.push("/admin/associations")}
          >
            <h3 className="font-semibold text-orange-800 text-lg mb-2">Asociaciones</h3>
            <p className="text-orange-600">Asociar alumnos a apoderados y asignaturas a profesores</p>
          </div>
          
          <div 
            className="bg-red-50 p-6 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => router.push("/admin/reports")}
          >
            <h3 className="font-semibold text-red-800 text-lg mb-2">Reportes</h3>
            <p className="text-red-600">Ver reportes y estadísticas del sistema</p>
          </div>
          
          <div 
            className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => router.push("/admin/settings")}
          >
            <h3 className="font-semibold text-gray-800 text-lg mb-2">Configuración</h3>
            <p className="text-gray-600">Configurar parámetros del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
} 