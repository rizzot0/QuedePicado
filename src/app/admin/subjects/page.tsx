"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
  teacherName: string;
  teacherEmail: string;
  gradeCount: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjectCount: number;
  subjects: Array<{ id: string; name: string }>;
}

export default function AdminSubjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", teacherId: "" });
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
      const [subjectsRes, teachersRes] = await Promise.all([
        fetch("/api/admin/subjects"),
        fetch("/api/admin/teachers")
      ]);
      
      const subjectsData = await subjectsRes.json();
      const teachersData = await teachersRes.json();
      
      if (subjectsData.ok) {
        setSubjects(subjectsData.subjects);
      }
      
      if (teachersData.ok) {
        setTeachers(teachersData.teachers);
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
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Error al crear asignatura");
      } else {
        setSuccess("¡Asignatura creada exitosamente!");
        setForm({ name: "", teacherId: "" });
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
        <h1 className="text-3xl font-bold">Gestión de Asignaturas</h1>
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
          <h2 className="text-xl font-semibold mb-4">Crear Nueva Asignatura</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nombre de la Asignatura</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Matemáticas, Lenguaje, Ciencias..."
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Profesor Responsable</label>
              <select
                name="teacherId"
                value={form.teacherId}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar profesor</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email}) - {teacher.subjectCount} asignaturas
                  </option>
                ))}
              </select>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Asignatura"}
            </button>
          </form>
        </div>

        {/* Lista de asignaturas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Asignaturas del Sistema</h2>
          {subjects.length === 0 ? (
            <p className="text-gray-500">No hay asignaturas registradas aún.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {subjects.map((subject) => (
                <div key={subject.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <p className="text-sm text-gray-600">
                        Profesor: {subject.teacherName} ({subject.teacherEmail})
                      </p>
                      <p className="text-sm text-purple-600">
                        Notas registradas: {subject.gradeCount}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Activa
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