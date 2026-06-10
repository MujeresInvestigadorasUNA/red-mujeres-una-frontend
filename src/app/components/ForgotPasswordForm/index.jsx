"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            return toast.error("Por favor, ingresa tu correo electrónico");
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                const detail = data?.detail;
                const message =
                    typeof detail === "string"
                        ? detail
                        : "No fue posible procesar tu solicitud. Inténtalo nuevamente.";
                return toast.error(message);
            }

            setSubmitted(true);
            toast.success("Verifica tu correo electrónico para recuperar tu contraseña");
        } catch (err) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Image 
                src="/images/Logo_Transparente.png" 
                alt="Logo" 
                width={3000} 
                height={3000}
                className="w-60 h-50 object-cover border-4 bg-white rounded
                border-white shadow-lg pt-3 px-2 rounded" 
            />
            <form
                className="flex flex-col gap-3 bg-[#E7473C] rounded p-4 px-5 w-1/2"
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl font-bold text-center text-white">
                    Recuperar Contraseña
                </h2>

                {!submitted ? (
                    <>
                        <p className="text-white text-sm text-center">
                            Ingresa tu correo electrónico y te enviaremos un enlace para
                            recuperar tu contraseña.
                        </p>
                        <Label
                            htmlFor="email"
                            className="font-semibold text-white text-md"
                        >
                            Correo Electrónico
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white h-12 rounded"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            className="bg-white text-[#E7473C] font-bold h-12 rounded hover:bg-gray-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner size="sm" color="text-[#E7473C]" />
                            ) : (
                                "Recuperar Contraseña"
                            )}
                        </Button>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="text-white text-sm mb-4">
                            Se ha enviado un enlace de recuperación a tu correo electrónico.
                            Por favor, revisa tu bandeja de entrada.
                        </p>
                        <Button
                            type="button"
                            onClick={() => {
                                setEmail("");
                                setSubmitted(false);
                            }}
                            className="bg-white text-[#E7473C] font-bold h-12 rounded hover:bg-gray-200 w-full"
                        >
                            Volver
                        </Button>
                    </div>
                )}

                <div className="text-center mt-2">
                    <Link
                        href="/IniciarSesion"
                        className="text-white text-sm hover:underline"
                    >
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </form>
        </>
    );
}
