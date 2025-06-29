"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface Student {
  id: string;
  name: string;
  lastName: string;
  grade: string;
  rut: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  value: number;
  type: string;
  date: string;
  studentName: string;
  subjectName: string;
}

export default function TeacherGradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    value: "", 
    type: "CONTROL", 
    studentId: "", 
    subjectId: "" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "TEACHER") {
      router.push("/login");
    } else if (session?.user) {
      loadData();
    }
  }, [session, status, router]);

  const loadData = async () => {
    try {
      // Obtener el ID del profesor
      const teacherRes = await fetch(`/api/admin/teachers`);
      const teacherData = await teacherRes.json();
      
      if (teacherData.ok) {
        const teacher = teacherData.teachers.find((t: any) => 
          t.email === (session?.user as any).email
        );
        
        if (teacher) {
          const dataRes = await fetch(`/api/teacher/data?teacherId=${teacher.id}`);
          const data = await dataRes.json();
          
          if (data.ok) {
            setStudents(data.students);
            setSubjects(data.subjects);
            
            // Preseleccionar asignatura si viene en la URL
            const subjectIdFromUrl = searchParams.get('subjectId');
            if (subjectIdFromUrl && data.subjects.some((s: any) => s.id === subjectIdFromUrl)) {
              setForm(prev => ({ ...prev, subjectId: subjectIdFromUrl }));
            }
          }
        }
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
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Error al crear nota");
      } else {
        setSuccess("¡Nota ingresada exitosamente!");
        setForm({ value: "", type: "CONTROL", studentId: "", subjectId: form.subjectId }); // Mantener la asignatura seleccionada
        loadGrades(); // Recargar las notas
      }
    } catch (error) {
      setLoading(false);
      setError("Error de conexión");
    }
  };

  const loadGrades = async () => {
    try {
      const res = await fetch("/api/grades");
      const data = await res.json();
      if (data.ok) {
        setGrades(data.grades);
      }
    } catch (error) {
      console.error("Error al cargar notas:", error);
    }
  };

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

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ingreso de Notas</h1>
        <button
          onClick={() => router.push("/teacher/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de ingreso */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ingresar Nueva Nota</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Alumno</label>
              <select
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                required
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
            <div>
              <label className="block mb-1 font-medium">Asignatura</label>
              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar asignatura</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Tipo de Evaluación</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="CONTROL">Control</option>
                <option value="PRUEBA">Prueba</option>
                <option value="EXAMEN">Examen</option>
                <option value="TRABAJO">Trabajo</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Nota (1.0 - 7.0)</label>
              <input
                name="value"
                type="number"
                step="0.1"
                min="1.0"
                max="7.0"
                value={form.value}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar Nota"}
            </button>
          </form>
        </div>

        {/* Lista de notas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notas Registradas</h2>
          {grades.length === 0 ? (
            <p className="text-gray-500">No hay notas registradas aún.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {grades.map((grade) => (
                <div key={grade.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{grade.studentName}</h3>
                      <p className="text-sm text-gray-600">{grade.subjectName}</p>
                      <p className="text-sm text-gray-500">
                        {getTypeLabel(grade.type)} • {new Date(grade.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-lg font-bold ${
                      grade.value >= 4.0 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
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