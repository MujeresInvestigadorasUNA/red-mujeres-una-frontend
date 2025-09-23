"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

function getStoredToken() {
  if (typeof window === "undefined") return null;
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");
  const type =
    localStorage.getItem("token_type") ||
    sessionStorage.getItem("token_type") ||
    "Bearer";
  return token ? { token, type } : null;
}

export default function MiPerfil() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [user, setUser] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const base =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const auth = getStoredToken();

      if (!auth) {
        router.replace("/IniciarSesion");
        return;
      }

      const res = await fetch(`${base}/api/v1/users/me`, {
        method: "GET", // según tu API con body
        headers: {
          "Content-Type": "application/json",
          Authorization: `${auth.type} ${auth.token}`,
        },
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json().catch(() => ({}))
        : await res.text();

      if (res.status === 401) {
        // sesión inválida/expirada
        handleLogout(false);
        return;
      }

      if (!res.ok) {
        const msg =
          (payload && payload.detail) ||
          (payload && payload.message) ||
          (typeof payload === "string" ? payload : "") ||
          `Error ${res.status}`;
        setErr(msg);
        return;
      }

      setUser({
        id: payload.id,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
      });
    } catch (e) {
      setErr(e?.message || "Fallo de red");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  function handleLogout(redirect = true) {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("token_type");
      }
    } finally {
      if (redirect) router.replace("/IniciarSesion");
    }
  }

  const initial =
    (user.first_name?.[0] || user.email?.[0] || "U").toUpperCase();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center text-xl font-bold">
          {initial}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-gray-600">Información de tu cuenta</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-6 h-6 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
          Cargando…
        </div>
      ) : (
        <>
          {err ? (
            <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm mb-6">
              {err}
            </div>
          ) : null}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                value={user.first_name || ""}
                readOnly
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <input
                type="text"
                value={user.last_name || ""}
                readOnly
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                value={user.email || ""}
                readOnly
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                ID de usuario
              </label>
              <input
                type="text"
                value={String(user.id ?? "")}
                readOnly
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 bg-gray-50"
              />
            </div>
          </section>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => handleLogout(true)}
              className="rounded bg-[#b62116] text-white px-4 py-2 shadow hover:opacity-90"
            >
              Cerrar sesión
            </button>

            {/* Botón para reintentar (útil en depuración) */}
            <button
              onClick={() => fetchMe()}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              title="Volver a cargar los datos"
            >
              Recargar datos
            </button>
          </div>
        </>
      )}
    </main>
  );
}
