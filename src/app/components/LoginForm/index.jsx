"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { iconEye, iconEyeSlash, iconReturn } from "@/app/assets/icons";
import { 
    InputGroup, 
    InputGroupAddon, 
    InputGroupButton, 
    InputGroupInput 
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { loginUser } from "@/lib/api/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/app/contexts/UserContext";

export default function LoginForm() {
    const { setUserData, setToken } = useUser();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            return toast.error("Por favor, complete todos los campos");
        }
        setLoading(true);

        try {
            const response = await loginUser({ email: form.email, password: form.password });
            if (!response.ok) {
                const data = await response.json();
                return toast.warning(data.detail?.[0]?.msg || "Error al iniciar sesión");
            }
            const data = await response.json();
            setUserData(data);
            setToken(data.access_token);
            window.location.href = "/";
        } catch (err) {
            toast.warning("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Link
                href="/" 
                className="absolute top-5 left-5"
            >
                {iconReturn({ size: 30, color: "white" })}
            </Link>
            <Image 
                src="/images/logo.png" 
                alt="Logo" 
                width={3000} 
                height={3000}
                className="w-40 h-40 object-cover rounded-full border-4 
                border-white shadow-lg" 
            />
            <form 
                className="flex flex-col gap-3 bg-[#E7473C] rounded p-4 
                px-5 w-1/2" 
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl font-bold text-center text-white">
                    Iniciar Sesión
                </h2>
                <Label 
                    htmlFor="email" 
                    className="font-semibold text-white text-md"
                >
                    Correo Electrónico
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Correo Electrónico"
                    value={form.email}
                    onChange={onChange}
                    className="bg-white h-12 rounded"
                    style={{ fontSize: "1rem"}}
                />
                <Label 
                    htmlFor="password" 
                    className="font-semibold text-white text-md"
                >
                    Contraseña
                </Label>
                <InputGroup className="bg-white h-12 rounded">
                    <InputGroupInput 
                        id="password" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Contraseña"
                        value={form.password} 
                        onChange={onChange}
                        style={{ fontSize: "1rem"}}
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
                <Button 
                    type="submit" 
                    className="bg-[#B62116] text-white w-full mt-3 rounded
                    hover:bg-[#8A192A] hover:cursor-pointer"
                    disabled={loading}
                >
                    {loading ? <Spinner /> : "Iniciar Sesión"}
                </Button>
                <hr className="border-white my-3" />
                <Link 
                    href="/Registrarse" 
                    className="text-gray-200 hover:underline text-center"
                >
                    ¿No tienes una cuenta? <br /> Regístrate aquí
                </Link>
            </form>
        </>
    );
}