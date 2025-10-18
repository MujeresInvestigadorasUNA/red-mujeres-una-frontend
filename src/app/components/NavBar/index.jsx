"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

export default function NavBar() {
  const router = useRouter();

  const [user, setUser] = useState(null); // { id, first_name, last_name, email }
  const [loadingUser, setLoadingUser] = useState(true);
  const [uiError, setUiError] = useState(""); // visible en UI

  const fetchMe = useCallback(async () => {
    setLoadingUser(true);
    setUiError("");

    try {
      const base =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const auth = getStoredToken();

      console.debug("[NavBar] API base:", base);
      console.debug("[NavBar] Token presente:", !!auth);

      if (!auth) {
        setUser(null);
        return;
      }

      const res = await fetch(`${base}/api/v1/users/me`, {
        method: "GET", // <-- según tu API
        headers: {
          "Content-Type": "application/json",
          Authorization: `${auth.type} ${auth.token}`,
        },
        // Si tu backend usara cookie HttpOnly, usarías credentials: "include"
        // y NO enviarías Authorization
        // credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json().catch(() => ({}))
        : await res.text();

      console.debug("[NavBar] /users/me status:", res.status);
      console.debug("[NavBar] /users/me payload:", payload);

      if (!res.ok) {
        // Muestra error visible y deja el login
        const msg =
          (payload && payload.detail) ||
          (payload && payload.message) ||
          (typeof payload === "string" ? payload : "") ||
          `Error ${res.status}`;
        setUser(null);
        setUiError(msg);
        return;
      }

      // Esperado: { id, first_name, last_name, email }
      const data = payload;
      if (data && typeof data === "object" && "email" in data) {
        setUser({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        });
      } else {
        setUser(null);
        setUiError("Respuesta inesperada del servidor.");
      }
    } catch (err) {
      console.error("[NavBar] /users/me error:", err);
      setUser(null);
      setUiError(err?.message || "Fallo de red");
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Reacciona si el token cambia en otra pestaña
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access_token" || e.key === "token_type") {
        fetchMe();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchMe]);

  const initial =
    (user?.first_name?.[0] ||
      user?.email?.[0] ||
      "U").toUpperCase();

  return (
    <nav className="flex justify-between items-center px-5 py-2 sticky top-0 text-white z-10 mainSection">
      <Link href="/" className="font-bold">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={60}
          height={60}
          className="border-[#8A192A] border-3 rounded-full shadow"
        />
      </Link>

      <ul className="flex gap-10 text-[#F0F0F0]">
        <li><Link href="/Foros">Foros</Link></li>
        <li><Link href="/Cursos">Cursos</Link></li>
        <li><Link href="/Investigaciones">Investigaciones</Link></li>
      </ul>

      <div className="flex items-center gap-3 min-w-[160px] justify-end">
        {/* Chip de error visible si algo falla */}
        {uiError ? (
          <span
            title={uiError}
            className="max-w-[260px] truncate rounded bg-red-600/90 px-2 py-1 text-xs shadow"
          >
            {uiError}
          </span>
        ) : null}

        {loadingUser ? (
          <div
            className="w-9 h-9 rounded-full border-2 border-white/70 border-t-transparent animate-spin"
            aria-label="Cargando"
          />
        ) : user ? (
          <button
            onClick={() => router.push("/MiPerfil")}
            className="w-9 h-9 rounded-full bg-white text-[#b62116] font-bold flex items-center justify-center shadow hover:opacity-90 transition"
            title={`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email}
            aria-label="Ir a Mi Perfil"
          >
            {initial}
          </button>
        ) : (
          <>
            <Link
              href="/MiForo"
              className="bg-[#b62116] text-white px-3 py-1 rounded shadow"
            >
              Mi Foro
            </Link>
            <Link
              href="/IniciarSesion"
              className="bg-[#b62116] text-white px-3 py-1 rounded shadow"
            >
              Iniciar Sesión
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
