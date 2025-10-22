"use client";
import { useState } from "react";
import { iconEye, iconEyeSlash, iconReturn } from "../../assets/icons";
import Image from "next/image";
import Link from "next/link";

export default function IniciarSesion() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // Send POST request to the backend with email and password
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.msg || "Something went wrong");
      } else {
        const data = await response.json();
        // Store JWT token in localStorage or sessionStorage
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify({
          id: data.id,
          email: data.email,
          name: data.name,
          last_name: data.last_name,
          user_type_id: data.user_type_id,  // Or use just data.user_type_id, depending on your backend response
        }));
      
        // Redirect to a protected page (e.g., dashboard)
        window.location.href = "/"; // Or you can use Next.js routing
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <form
        className="flex flex-col gap-3 bg-[#E7473C] rounded p-4 px-5 w-1/2"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center text-white ">Iniciar Sesión</h2>

        {/* Display any error messages */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label htmlFor="email" className="font-semibold text-white">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Correo Electrónico"
            className="rounded border border-gray-300 px-3 py-2 w-full mt-2 
            bg-white customOutline"
            onChange={onChange}
            value={form.email}
          />
        </div>

        <div>
          <label htmlFor="password" className="font-semibold text-white">
            Contraseña
          </label>
          <span className="mt-2 flex border border-gray-300 rounded bg-white 
          customOutline">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="rounded border border-gray-300 px-3 py-2 w-full 
              bg-white hover:outline-none focus:outline-none border-none 
              hover:border-none inputHideOutline"
              onChange={onChange}
              value={form.password}
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

        <button
          type="submit"
          className="rounded bg-[#B62116] text-white px-4 py-2 hover:bg-[#8A192A] 
          transition disabled:opacity-60 hover:cursor-pointer"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>

        <hr className="border-white my-3" />
        <Link href="/Registrarse" className="text-gray-200 hover:underline text-center">
          ¿No tienes una cuenta? <br /> Regístrate aquí
        </Link>
      </form>
    </main>
  );
}