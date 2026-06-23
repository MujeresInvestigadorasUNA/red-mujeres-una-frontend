"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { iconEye, iconEyeSlash } from "@/app/assets/icons";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { fetchUserByEmail } from "@/lib/api/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/app/contexts/UserContext";
import { AlertCircle } from "lucide-react";

export default function LoginForm() {
    const { setUserData, setToken } = useUser();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        if (searchParams.get("session_expired") === "true") {
            setSessionExpired(true);
        }
    }, [searchParams]);

    const togglePassword = () => setShowPassword(!showPassword);
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const isValidEmail = (email) => {
        return /^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email);
    };

    const getFirebaseErrorMessage = (code) => {
        switch (code) {
            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                return "Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.";
            case "auth/too-many-requests":
                return "Demasiados intentos fallidos. Intenta de nuevo más tarde.";
            case "auth/user-disabled":
                return "Esta cuenta ha sido deshabilitada.";
            default:
                return "No fue posible iniciar sesión. Inténtalo nuevamente.";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email.trim()) {
            return toast.error("Ingresa tu correo electrónico.");
        }

        if (!isValidEmail(form.email)) {
            return toast.error("Ingresa un correo electrónico válido.");
        }

        if (!form.password.trim()) {
            return toast.error("La contraseña no puede estar vacía.");
        }

        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
            const token = await userCredential.user.getIdToken();

            setToken(token);

            try {
                const userData = await fetchUserByEmail(form.email.trim());
                if (userData) {
                    setUserData(userData);
                }
            } catch {}

            window.location.href = "/";
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

            {sessionExpired && (
                <div className="flex items-center gap-2.5 w-full bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                        Tu sesión ha expirado. Por favor, inicia sesión de nuevo.
                    </p>
                </div>
            )}

            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-center text-gray-800">
                    Iniciar Sesión
                </h2>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="email" className="font-semibold text-gray-700 text-sm">
                        Correo Electrónico
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={form.email}
                        onChange={onChange}
                        className="h-11 rounded-lg border-gray-200"
                        style={{ fontSize: "1rem" }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="password" className="font-semibold text-gray-700 text-sm">
                        Contraseña
                    </Label>
                    <InputGroup className="h-11 rounded-lg border-gray-200">
                        <InputGroupInput
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            value={form.password}
                            onChange={onChange}
                            style={{ fontSize: "1rem" }}
                        />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton type="button" onClick={togglePassword}>
                                {showPassword
                                    ? iconEyeSlash({ size: 16, color: "#8A192A" })
                                    : iconEye({ size: 16, color: "#8A192A" })}
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                <Link href="/OlvideMiClave" className="text-xs text-[#C0392B] hover:underline text-right -mt-2">
                    ¿Olvidaste tu contraseña?
                </Link>
                <Button
                    type="submit"
                    className="bg-[#C0392B] text-white w-full h-11 rounded-lg hover:bg-[#8A192A] hover:cursor-pointer font-semibold"
                    disabled={loading}
                >
                    {loading ? <Spinner /> : "Iniciar Sesión"}
                </Button>
                <div className="border-t border-gray-100 pt-4 text-center">
                    <Link href="/Registrarse" className="text-sm text-gray-500 hover:text-[#C0392B] transition">
                        ¿No tienes una cuenta? <span className="font-semibold text-[#C0392B]">Regístrate aquí</span>
                    </Link>
                </div>
            </form>
        </div>
    );
}
