"use client";
import { useState } from "react";
import { 
  iconEye, 
  iconEyeSlash, 
  iconInstagram, 
  iconFacebook, 
  iconWhatsApp, 
  iconReturn 
} from "../../assets/icons";
import Image from "next/image";
import Link from "next/link";

export default function Registrarse() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          user_type_id: 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Registration successful!");
        // Redirect to login page or home
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify({
          id: data.id,
          email: data.email,
          name: data.name,
          last_name: data.last_name,
          user_type_id: data.user_type_id,
        }));

        window.location.href = "/";
      } else {
        const data = await response.json();
        setError(data.detail || "Something went wrong");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-[100vh]">
      <Link href="/" className="position absolute top-5 left-5 hover:cursor-pointer">
        {iconReturn({ size: 30 })}
      </Link>
      <section className="w-1/2 bg-[#F0F0F0] h-full toolsSection">
        <Image
          src="/images/logo.png"
          alt="Portada de la Red de Mujeres Académicas UNA"
          width={3000}
          height={3000}
          className="w-50 h-50 m-auto mt-10"
          priority
        />
        <h1 className="text-3xl font-bold text-center text-[#E7473C]">
          Red de Mujeres Académicas UNA
        </h1>
        <p className="text-center mt-5 px-10 text-gray-600 text-lg">
          Plataforma para la visibilización, colaboración y apoyo entre
          mujeres académicas de la Universidad Nacional de Asunción.
        </p>
        <div className="flex justify-center mt-5 gap-5">
          {iconInstagram({ size: 24, color: "#8A192A" })}
          {iconFacebook({ size: 24, color: "#8A192A" })}
          {iconWhatsApp({ size: 24, color: "#8A192A" })}
        </div>
      </section>
      <section className="w-1/2 mainSection h-full p-5 flex">
        <form className="flex flex-col gap-3 rounded p-4 px-5 w-full" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center text-white ">
            Registrarse
          </h2>

          {error && <p className="text-red-500">{error}</p>} {/* Display error message */}

          <div>
            <label htmlFor="name" className="font-semibold text-white">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Nombre"
              className="rounded border border-gray-300 px-3 py-2 w-full mt-2
              bg-white customOutline"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="font-semibold text-white">
              Apellidos
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Apellidos"
              className="rounded border border-gray-300 px-3 py-2 w-full 
              mt-2 bg-white customOutline"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="font-semibold text-white">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Correo Electrónico"
              className="rounded border border-gray-300 px-3 py-2 w-full 
              mt-2 bg-white customOutline"
              value={formData.email}
              onChange={handleChange}
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
                hover:outline-none focus:outline-none border-none inputHideOutline"
                value={formData.password}
                onChange={handleChange}
              />
              <button
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
          <div>
            <label htmlFor="confirmPassword" className="font-semibold text-white">
              Confirmar Contraseña
            </label>
            <span className="mt-2 flex border border-gray-300 rounded bg-white customOutline">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Contraseña"
                className="rounded border border-gray-300 px-3 py-2 w-full bg-white
                hover:outline-none focus:outline-none border-none inputHideOutline"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                onClick={toggleConfirmPassword}
                type="button"
                className="mr-3 hover:cursor-pointer self-center"
              >
                {showConfirmPassword
                  ? iconEyeSlash({ size: 16, color: "#8A192A" })
                  : iconEye({ size: 16, color: "#8A192A" })}
              </button>
            </span>
          </div>
          <button className="rounded bg-[#B62116] text-white px-4 py-2">
            Registrarse
          </button>
          <hr className="border-white" />
          <Link href="/IniciarSesion" className="text-gray-200 hover:underline text-center">
            ¿Ya tienes una cuenta? <br /> Inicia sesión aquí
          </Link>
        </form>
      </section>
    </main>
  );
}