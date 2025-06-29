"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  teacher?: { id: string };
  parent?: { 
    id: string;
    students: Array<{ id: string; name: string; lastName: string }>;
  };
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "TEACHER" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "ADMIN") {
      router.push("/login");
    } else if (session?.user) {
      loadUsers();
    }
  }, [session, status, router]);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
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
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Error al crear usuario");
      } else {
        setSuccess("¡Usuario creado exitosamente!");
        setForm({ name: "", email: "", password: "", role: "TEACHER" });
        loadUsers(); // Recargar la lista
      }
    } catch (error) {
      setLoading(false);
      setError("Error de conexión");
    }
  };

  const getRoleLabel = (role: string) => {
    return role === "TEACHER" ? "Profesor" : "Apoderado";
  };

  const getStudentCount = (user: User) => {
    if (user.role === "PARENT" && user.parent) {
      return user.parent.students.length;
    }
    return 0;
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
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
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
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Usuario</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nombre completo</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Contraseña</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Rol</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="TEACHER">Profesor</option>
                <option value="PARENT">Apoderado</option>
              </select>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </form>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Usuarios del Sistema</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No hay usuarios registrados aún.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        {getRoleLabel(user.role)} • 
                        Creado: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      {user.role === "PARENT" && (
                        <p className="text-sm text-blue-600">
                          Alumnos asociados: {getStudentCount(user)}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "TEACHER" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {getRoleLabel(user.role)}
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