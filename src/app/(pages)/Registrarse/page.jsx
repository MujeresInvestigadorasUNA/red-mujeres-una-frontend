"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registrarse() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    // Minimal client-side validation
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password.trim()) {
      setErr("Por favor completa todos los campos.");
      return;
    }
    if (!emailRegex.test(form.email)) {
      setErr("Correo electrónico no válido.");
      return;
    }
    if (form.password.length < 8) {
      setErr("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setLoading(true);

      // External FastAPI URL from env (see .env.local below)
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!base) {
        throw new Error("Falta configurar NEXT_PUBLIC_API_BASE_URL.");
      }

      const res = await fetch(`${base}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Adjust keys if your FastAPI expects different names
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
        }),
        // Include credentials if your FastAPI uses cookies/sessions:
        // credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          data?.error ||
          (Array.isArray(data?.errors) && data.errors.join(", ")) ||
          "No se pudo registrar el usuario.";
        throw new Error(msg);
      }

      setOkMsg("¡Registro exitoso! Redirigiendo al inicio de sesión…");
      setForm({ first_name: "", last_name: "", email: "", password: "" });

      // Pequeña pausa para mostrar el mensaje (opcional)
      setTimeout(() => router.push("/IniciarSesion"), 800);
    } catch (e) {
      setErr(e.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex gap-13 flex-grow px-20 py-10 h-[100%]">
      <Image
        src="/images/tool2.png"
        alt="Portada de la Red de Mujeres Académicas UNA"
        width={500}
        height={300}
        className="mt-5 h-90 object-cover rounded min-w-[40vw]"
        priority
      />

      <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit} noValidate>
        <h1 className="text-2xl font-bold">Registrarse</h1>

        {err ? (
          <p
            className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm"
            aria-live="assertive"
          >
            {err}
          </p>
        ) : null}
        {okMsg ? (
          <p
            className="rounded border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm"
            aria-live="polite"
          >
            {okMsg}
          </p>
        ) : null}

        <div>
          <label htmlFor="first_name" className="font-semibold">
            Nombre
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Nombre"
            className="rounded border border-gray-300 px-3 py-2 w-full mt-2"
            value={form.first_name ?? ""}
            onChange={onChange}
            autoComplete="given-name"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="font-semibold">
            Apellidos
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Apellidos"
            className="rounded border border-gray-300 px-3 py-2 w-full mt-2"
            value={form.last_name ?? ""}
            onChange={onChange}
            autoComplete="family-name"
          />
        </div>

        <div>
          <label htmlFor="email" className="font-semibold">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Correo Electrónico"
            className="rounded border border-gray-300 px-3 py-2 w-full mt-2"
            value={form.email ?? ""}
            onChange={onChange}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="font-semibold mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            className="rounded border border-gray-300 px-3 py-2 w-full mt-2"
            value={form.password ?? ""}
            onChange={onChange}
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres.</p>
        </div>

        <button
          type="submit"
          className="rounded bg-gray-800 text-white px-4 py-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <Link href="/IniciarSesion" className="text-gray-400 hover:underline text-center">
          ¿Ya tienes una cuenta? <br /> Inicia sesión
        </Link>
      </form>
    </main>
  );
}
