"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const getFirebaseErrorMessage = (code) => {
        switch (code) {
            case "auth/user-not-found":
                return "No existe una cuenta con este correo electrónico.";
            case "auth/invalid-email":
                return "El correo electrónico no es válido.";
            case "auth/too-many-requests":
                return "Demasiados intentos. Intenta de nuevo más tarde.";
            default:
                return "No fue posible procesar tu solicitud. Inténtalo nuevamente.";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            return toast.error("Por favor, ingresa tu correo electrónico");
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email.trim());
            setSubmitted(true);
            toast.success("Verifica tu correo electrónico para recuperar tu contraseña");
        } catch (err) {
            toast.error(getFirebaseErrorMessage(err?.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-2">
                <Image
                    src="/images/Logo-Red-De-Mujeres-notext.png"
                    alt="Logo"
                    width={400}
                    height={400}
                    className="w-20 h-auto object-contain"
                />
                <div className="text-center">
                    <p className="font-semibold text-gray-800 text-sm">Red de Mujeres Académicas e Investigadoras</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Universidad Nacional de Costa Rica</p>
                </div>
            </div>

            <div className="w-full border-t border-gray-100" />

            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-center text-gray-800">
                    Recuperar Contraseña
                </h2>

                {!submitted ? (
                    <>
                        <p className="text-gray-500 text-sm text-center">
                            Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.
                        </p>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="email" className="font-semibold text-gray-700 text-sm">
                                Correo Electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 rounded-lg border-gray-200"
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="bg-[#C0392B] text-white font-semibold h-11 rounded-lg hover:bg-[#8A192A] hover:cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? <Spinner size="sm" /> : "Enviar enlace de recuperación"}
                        </Button>
                    </>
                ) : (
                    <div className="text-center flex flex-col gap-4">
                        <p className="text-gray-600 text-sm">
                            Se ha enviado un enlace de recuperación a tu correo electrónico.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <p className="text-sm text-amber-800">
                                Revisa tu <span className="font-bold">bandeja de entrada</span> o tu carpeta de <span className="font-bold">spam / correo no deseado</span>.
                            </p>
                        </div>
                        <Link
                            href="/IniciarSesion"
                            className="bg-[#C0392B] text-white font-semibold h-11 rounded-lg hover:bg-[#8A192A] hover:cursor-pointer w-full flex items-center justify-center"
                        >
                            Volver al Inicio de Sesión
                        </Link>
                    </div>
                )}

                <div className="border-t border-gray-100 pt-3 text-center">
                    {!submitted ? (
                        <Link href="/IniciarSesion" className="text-sm text-gray-500 hover:text-[#C0392B] transition">
                            ← Volver a <span className="font-semibold text-[#C0392B]">Iniciar Sesión</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="text-sm text-gray-500 hover:text-[#C0392B] transition"
                        >
                            Reenviar enlace de recuperación
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
