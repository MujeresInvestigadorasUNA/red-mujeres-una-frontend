"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, ArrowLeft } from "lucide-react";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, hasFirebaseConfig } from "@/lib/firebase/client";
import { cleanupIncompleteFirebaseUser } from "@/lib/api/auth";

export default function SignUpForm() {
  const baseCompleteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/Registrarse/Completar`
      : "http://localhost:3000/Registrarse/Completar";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [signupSessionId, setSignupSessionId] = useState("");

  const isValidEmail = (value) => {
    return /^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(value);
  };

  const persistSignupSession = ({ sessionId, emailValue, temporaryPassword }) => {
    localStorage.setItem(
      `signup_session_${sessionId}`,
      JSON.stringify({
        email: emailValue,
        temporaryPassword,
        createdAt: Date.now(),
      })
    );
    localStorage.setItem("signup_active_session_id", sessionId);
  };

  useEffect(() => {
    const existingSessionId = localStorage.getItem("signup_active_session_id") || "";
    if (!existingSessionId) {
      return;
    }

    const existingSessionRaw = localStorage.getItem(`signup_session_${existingSessionId}`);
    if (!existingSessionRaw) {
      return;
    }

      try {
      const existingSession = JSON.parse(existingSessionRaw);
      if (existingSession?.email) {
        setSignupSessionId(existingSessionId);
        setEmail(existingSession.email);

      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getFirebaseErrorMessage = (code) => {
    switch (code) {
      case "auth/unauthorized-continue-uri":
        return "El dominio de la URL de redirección no está autorizado en Firebase. Añade tu dominio en Firebase Console → Authentication → Authorized domains.";
      case "auth/configuration-not-found":
        return "Firebase Auth no esta configurado para este proyecto. Activa Authentication y Email/Password en Firebase Console.";
      case "auth/operation-not-allowed":
        return "El metodo Email/Password no esta habilitado en Firebase Authentication.";
      case "auth/invalid-api-key":
        return "La API key de Firebase es invalida. Revisa NEXT_PUBLIC_FIREBASE_API_KEY.";
      case "auth/email-already-in-use":
        return "Este correo ya esta registrado en Firebase.";
      case "auth/invalid-email":
        return "El correo electronico no es valido.";
      default:
        return "No se pudo completar la verificacion de correo. Intenta nuevamente.";
    }
  };

  const createSignupSessionId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  const buildVerificationRedirectUrl = (sessionId) => {
    return `${baseCompleteUrl}?session=${encodeURIComponent(sessionId)}`;
  };

  const handleStartVerification = async (e) => {
    e.preventDefault();

    if (!email?.trim()) {
      setError("Completa el email para continuar.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!hasFirebaseConfig || !auth) {
        setError("Falta configurar Firebase para la verificación de correo.");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Pre-check: cleanup verifica si existe en BD (conflict) o limpia huérfanos de Firebase (cleaned)
      try {
        const cleanupRes = await cleanupIncompleteFirebaseUser({ email: normalizedEmail });
        const cleanupData = await cleanupRes.json();

        if (cleanupData.status === "conflict") {
          setError("Este correo ya tiene una cuenta registrada. Inicia sesión en lugar de registrarte.");
          return;
        }
      } catch {
        // Si el endpoint falla, continuar con el flujo normal
      }

      const sessionId = createSignupSessionId();
      const temporaryPassword = `Tmp#${Math.random().toString(36).slice(-10)}A1`;

      const firebaseCredentials = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        temporaryPassword
      );

      persistSignupSession({
        sessionId,
        emailValue: email,
        temporaryPassword,
      });
      setSignupSessionId(sessionId);

      try {
        await sendEmailVerification(firebaseCredentials.user, {
          url: buildVerificationRedirectUrl(sessionId),
          handleCodeInApp: true,
        });
      } catch (err) {
        // If the continue URL domain is not allowlisted, try a fallback without a custom URL
        if (err?.code === "auth/unauthorized-continue-uri") {
          console.warn('[SignUpForm] unauthorized continue URL, retrying without custom url');
          try {
            await sendEmailVerification(firebaseCredentials.user);
            setSuccess(
              "Te enviamos un link de verificacion (sin redirección personalizada). Abre el correo y completa el registro."
            );
          } catch (err2) {
            throw err; // rethrow original to be handled below
          }
        } else {
          throw err;
        }
      }

      setSuccess(
        "Te enviamos un link de verificacion. Abre el correo y te redirigira a la pantalla para completar tu registro."
      );
    } catch (err) {
      console.debug(err);
      if (err?.code === "auth/email-already-in-use") {
        setError("Este correo ya está en uso. Si ya tienes una cuenta, inicia sesión.");
        return;
      }
      localStorage.removeItem("signup_active_session_id");
      setError(getFirebaseErrorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = email?.trim();
    if (!targetEmail) {
      setError("Ingresa tu correo electrónico para reenviar el link.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Verificar que no esté ya registrado en la BD
      const cleanupRes = await cleanupIncompleteFirebaseUser({ email: targetEmail });
      const cleanupData = await cleanupRes.json();

      if (cleanupData.status === "conflict") {
        setError("Este correo ya tiene una cuenta registrada. Inicia sesión en lugar de registrarte.");
        return;
      }

      // 2. El cleanup limpió cualquier huérfano de Firebase → recrear usuario y reenviar
      const sessionId = createSignupSessionId();
      const temporaryPassword = `Tmp#${Math.random().toString(36).slice(-10)}A1`;

      const firebaseCredentials = await createUserWithEmailAndPassword(
        auth,
        targetEmail,
        temporaryPassword
      );

      // Limpiar sesión anterior
      if (signupSessionId) {
        localStorage.removeItem(`signup_session_${signupSessionId}`);
      }

      persistSignupSession({
        sessionId,
        emailValue: targetEmail,
        temporaryPassword,
      });
      setSignupSessionId(sessionId);

      await sendEmailVerification(firebaseCredentials.user, {
        url: buildVerificationRedirectUrl(sessionId),
        handleCodeInApp: true,
      });

      setSuccess("Link de verificación reenviado. Revisa tu bandeja de entrada y spam.");
    } catch (err) {
      console.error(err);
      if (err?.code === "auth/email-already-in-use") {
        setError("No se pudo limpiar el registro anterior. Intenta de nuevo en unos minutos.");
        return;
      }
      if (err?.code === "auth/unauthorized-continue-uri") {
        console.warn('[SignUpForm] resend: unauthorized continue URL');
        // try fallback without custom url
        try {
          const firebaseCredentials = await createUserWithEmailAndPassword(
            auth,
            targetEmail,
            temporaryPassword
          );
          await sendEmailVerification(firebaseCredentials.user);
          setSuccess("Link de verificación reenviado (sin redirección personalizada). Revisa tu bandeja de entrada y spam.");
        } catch {
          setError(getFirebaseErrorMessage(err?.code));
        }
        return;
      }
      setError("No se pudo reenviar el correo de verificación. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col items-center gap-5 relative">
      <Link
        href="/IniciarSesion"
        className="absolute top-4 left-4 p-2 rounded-full text-gray-400 hover:text-[#C0392B] hover:bg-gray-100 transition-colors"
        title="Volver al inicio de sesión"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
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

      <form className="flex flex-col gap-4 w-full" onSubmit={handleStartVerification}>
        <h2 className="text-xl font-bold text-center text-gray-800">
          Registrarse
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
            className="h-11 rounded-lg border-gray-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ fontSize: "1rem" }}
          />
        </div>

        <Button
          type="submit"
          className="bg-[#B62116] text-white w-full rounded hover:bg-[#8A192A] hover:cursor-pointer"
          disabled={loading}
        >
          {loading ? <Spinner /> : "Enviar link de verificacion"}
        </Button>

        <Button
          type="button"
          className="bg-white text-[#8A192A] w-full rounded hover:bg-gray-100 hover:cursor-pointer border border-gray-200"
          onClick={handleResendVerification}
          disabled={loading || !email?.trim()}
        >
          Reenviar link de verificacion
        </Button>

        {error && (
          <div className="flex items-start gap-2.5 w-full bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Si no ves el correo en los próximos minutos, revisa tu bandeja de spam o correo no deseado.
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 text-center">
          <Link href="/IniciarSesion" className="text-sm text-gray-500 hover:text-[#C0392B] transition">
            ¿Ya tienes una cuenta? <span className="font-semibold text-[#C0392B]">Inicia sesión aquí</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
