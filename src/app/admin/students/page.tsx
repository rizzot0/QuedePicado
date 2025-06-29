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
  parentName: string;
  parentEmail: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  studentCount: number;
  students: Array<{ id: string; name: string; lastName: string }>;
}

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", lastName: "", rut: "", grade: "", parentId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const [studentsRes, parentsRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/parents")
      ]);
      
      const studentsData = await studentsRes.json();
      const parentsData = await parentsRes.json();
      
      if (studentsData.ok) {
        setStudents(studentsData.students);
      }
      
      if (parentsData.ok) {
        setParents(parentsData.parents);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Error al crear alumno");
      } else {
        setSuccess("¡Alumno creado exitosamente!");
        setForm({ name: "", lastName: "", rut: "", grade: "", parentId: "" });
        loadData(); // Recargar los datos
      }
    } catch (error) {
      setLoading(false);
      setError("Error de conexión");
    }
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
        <h1 className="text-3xl font-bold">Gestión de Alumnos</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de creación */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Alumno</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nombre</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Apellido</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">RUT</label>
              <input
                name="rut"
                value={form.rut}
                onChange={handleChange}
                required
                placeholder="12345678-9"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Curso</label>
              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar curso</option>
                <option value="1°A">1°A</option>
                <option value="1°B">1°B</option>
                <option value="2°A">2°A</option>
                <option value="2°B">2°B</option>
                <option value="3°A">3°A</option>
                <option value="3°B">3°B</option>
                <option value="4°A">4°A</option>
                <option value="4°B">4°B</option>
                <option value="5°A">5°A</option>
                <option value="5°B">5°B</option>
                <option value="6°A">6°A</option>
                <option value="6°B">6°B</option>
                <option value="7°A">7°A</option>
                <option value="7°B">7°B</option>
                <option value="8°A">8°A</option>
                <option value="8°B">8°B</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Apoderado</label>
              <select
                name="parentId"
                value={form.parentId}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar apoderado</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} ({parent.email}) - {parent.studentCount} alumnos
                  </option>
                ))}
              </select>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Alumno"}
            </button>
          </form>
        </div>

        {/* Lista de alumnos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Alumnos del Sistema</h2>
          {students.length === 0 ? (
            <p className="text-gray-500">No hay alumnos registrados aún.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{student.name} {student.lastName}</h3>
                      <p className="text-sm text-gray-600">RUT: {student.rut}</p>
                      <p className="text-sm text-gray-500">Curso: {student.grade}</p>
                      <p className="text-sm text-blue-600">
                        Apoderado: {student.parentName} ({student.parentEmail})
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Activo
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