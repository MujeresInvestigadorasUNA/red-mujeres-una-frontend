"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { iconEye, iconEyeSlash, iconReturn } from "../../assets/icons";
import Image from "next/image";
import Link from "next/link";

export default function IniciarSesion() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setErr("");
  //   setOkMsg("");

  //   if (!form.email.trim() || !form.password.trim()) {
  //     setErr("Correo y contraseña son obligatorios.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  //     const res = await fetch(`${base}/api/v1/auth/login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: form.email,
  //         password: form.password,
  //       }),
  //     });

  //     const data = await res.json().catch(() => ({}));

  //     if (!res.ok) {
  //       throw new Error(data?.detail || "Credenciales inválidas.");
  //     }

  //     // Si tu API devuelve el token en JSON, aquí lo recibes:
  //     // { "access_token": "...", "token_type": "bearer" }
  //     console.log("Login OK:", data);

  //     // Ejemplo: guardar token (ajústalo según tu necesidad)
  //     localStorage.setItem("access_token", data.access_token);
  //     localStorage.setItem("token_type", data.token_type);

  //     setOkMsg("¡Inicio de sesión exitoso!");
  //     setTimeout(() => router.push("/"), 800);
  //   } catch (e) {
  //     setErr(e.message || "Error al iniciar sesión.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    // <main className="flex gap-13 flex-grow px-20 py-10 h-[100%]">
    //   <Image
    //     src="/images/tool3.png"
    //     alt="Portada de la Red de Mujeres Académicas UNA"
    //     width={500}
    //     height={300}
    //     className="mt-5 h-90 object-cover rounded min-w-[40vw]"
    //     priority
    //   />

    //   <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
    //     <h1 className="text-2xl font-bold">Iniciar Sesión</h1>

    //     {err && <p className="text-red-600 text-sm">{err}</p>}
    //     {okMsg && <p className="text-green-600 text-sm">{okMsg}</p>}

    //     <div>
    //       <label htmlFor="email" className="font-semibold">
    //         Correo Electrónico
    //       </label>
    //       <input
    //         type="email"
    //         id="email"
    //         name="email"
    //         placeholder="Correo Electrónico"
    //         className="rounded border border-gray-300 px-3 py-2 w-full mt-2"
    //         value={form.email}
    //         onChange={onChange}
    //       />
    //     </div>

    //     <div>
    //       <label htmlFor="password" className="font-semibold mb-1">
    //         Contraseña
    //       </label>
    //       <input
    //         type="password"
    //         id="password"
    //         name="password"
    //         placeholder="Contraseña"
    //         className="rounded border border-gray-300 px-3 py-2 w-full mt-2"
    //         value={form.password}
    //         onChange={onChange}
    //       />
    //     </div>

    //     <button
    //       type="submit"
    //       className="rounded bg-gray-800 text-white px-4 py-2 disabled:opacity-60"
    //       disabled={loading}
    //     >
    //       {loading ? "Ingresando..." : "Iniciar Sesión"}
    //     </button>

    //     <Link href="/Registrarse" className="text-gray-400 hover:underline text-center">
    //       ¿No tienes una cuenta? <br /> Regístrate aquí
    //     </Link>
    //   </form>
    // </main>
    <main className="flex flex-col justify-center items-center bg-[#E7473C] 
    h-screen overflow-auto gap-5">
      <Link href="/" className="position absolute top-5 left-5 hover:cursor-pointer">
        {iconReturn({ size: 30, color: "white" })}
      </Link>
      <Image
        src="/images/logo.png"
        alt="Portada de la Red de Mujeres Académicas UNA"
        width={3000}
        height={3000}
        className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg"
        priority
      />
      <form className="flex flex-col gap-3 bg-[#E7473C] rounded p-4 px-5 w-1/2">
        <h2 className="text-2xl font-bold text-center text-white ">
          Iniciar Sesión
        </h2>
        <div>
          <label htmlFor="email" className="font-semibold text-white">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Correo Electrónico"
            className="rounded border border-gray-300 px-3 py-2 w-full mt-2 bg-white customOutline"
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="password" className="font-semibold text-white">
            Contraseña
          </label>
          <span className="mt-2 flex border border-gray-300 rounded bg-white customOutline">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="rounded border border-gray-300 px-3 py-2 w-full bg-white
              hover:outline-none focus:outline-none border-none hover:border-none
              inputHideOutline"
              onChange={onChange}
            />
            <button
              id="togglePassword"
              onClick={togglePassword}
              type="button"
              className="mr-3 hover:cursor-pointer self-center"
            >
              {showPassword
                ? iconEyeSlash({ size: 16, color: "#8A192A" })
                : iconEye({ size: 16, color: "#8A192A" })}
            </button>
          </span>
        </div>
        <button type="submit" className="rounded bg-[#B62116] text-white px-4 py-2 hover:bg-[#8A192A] 
        transition disabled:opacity-60 hover:cursor-pointer">
          Iniciar Sesión
        </button>
        <hr className="border-white my-3" />
        <Link href="/Registrarse" className="text-gray-200 hover:underline text-center">
          ¿No tienes una cuenta? <br /> Regístrate aquí
        </Link>
      </form>
    </main>
  );
}