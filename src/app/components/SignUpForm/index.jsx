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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import Image from "next/image";
import Link from "next/link";
import { registerUser } from "@/lib/api/auth";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const [formData, setFormData] = useState({
    firstName: "",
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
      const response = await registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        user_type_id: 1
      });

      if (response.ok) {
        const data = await response.json();
        alert("Registration successful!");
        // Redirect to login page or home
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify({
          id: data.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          user_type_id: 1,
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
    <>
      <Link href="/" className="position absolute top-5 left-5 hover:cursor-pointer">
        {iconReturn({ size: 30 })}
      </Link>
      <section className="w-1/2 toolsSection bg-[#F0F0F0]">
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
      <section className="w-1/2 mainSection p-5 overflow-auto">
        <form className="flex flex-col gap-3 rounded p-4 px-5 w-full overflow-hidden" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center text-white ">
            Registrarse
          </h2>

          {error && <p className="text-red-500">{error}</p>} {/* Display error message */}

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="firstName" className="font-semibold text-white">
              Nombre
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Nombre"
              className="rounded border border-gray-300 px-3 py-2 w-full
              bg-white h-12"
              value={formData.firstName}
              onChange={handleChange}
              style={{ fontSize: "1rem" }}
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="lastName" className="font-semibold text-white">
              Apellidos
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Apellidos"
              className="rounded border border-gray-300 px-3 py-2 w-full
              bg-white h-12"
              value={formData.lastName}
              onChange={handleChange}
              style={{ fontSize: "1rem" }}
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="email" className="font-semibold text-white">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Correo Electrónico"
              className="rounded border border-gray-300 px-3 py-2 w-full
              bg-white h-12"
              value={formData.email}
              onChange={handleChange}
              style={{ fontSize: "1rem" }}
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="password" className="font-semibold text-white">
              Contraseña
            </Label>
            <InputGroup className="bg-white h-12 rounded">
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                style={{ fontSize: "1rem" }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={togglePassword}
                >
                  {showPassword ?
                    iconEyeSlash({ size: 16, color: "#8A192A" }) :
                    iconEye({ size: 16, color: "#8A192A" })
                  }
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="confirmPassword" className="font-semibold text-white">
              Confirmar Contraseña
            </Label>
            <InputGroup className="bg-white h-12 rounded">
              <InputGroupInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ fontSize: "1rem" }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={toggleConfirmPassword}
                >
                  {showConfirmPassword
                    ? iconEyeSlash({ size: 16, color: "#8A192A" })
                    : iconEye({ size: 16, color: "#8A192A" })}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <Button
            type="submit"
            className="bg-[#B62116] text-white w-full rounded hover:bg-[#8A192A]
            hover:cursor-pointer"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Registrarse"}
          </Button>
          <hr className="border-white" />
          <Link href="/IniciarSesion" className="text-gray-200 hover:underline text-center">
            ¿Ya tienes una cuenta? <br /> Inicia sesión aquí
          </Link>
        </form>
      </section>
    </>
  );
}