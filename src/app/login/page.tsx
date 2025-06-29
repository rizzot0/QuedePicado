"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const userRole = (session.user as any).role;
      // Redirigir según el rol
      if (userRole === "TEACHER") {
        router.push("/teacher/dashboard");
      } else if (userRole === "PARENT") {
        router.push("/parent/dashboard");
      } else if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      }
    }
  }, [session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciales inválidas");
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (session) {
    return <div className="flex justify-center items-center h-screen">Redirigiendo...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">Credenciales de prueba:</p>
        <p className="text-xs text-gray-500">Admin: admin@escuela.cl / admin123</p>
      </div>
    </div>
  );
} 