"use client";

import { useEffect, useState } from "react";
import {
  iconInstagram,
  iconFacebook,
  iconWhatsApp,
} from "../../assets/icons";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
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

    if (!email) {
      setError("Completa el email para continuar.");
      setSuccess(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!hasFirebaseConfig || !auth) {
        setError("Falta configurar Firebase para la verificacion de correo.");
        return;
      }

      // Si hay una sesión guardada para este correo, reenviar verificación directamente
      const existingActiveId = localStorage.getItem("signup_active_session_id");
      if (existingActiveId) {
        const existingSessionRaw = localStorage.getItem(`signup_session_${existingActiveId}`);
        if (existingSessionRaw) {
          try {
            const existingSession = JSON.parse(existingSessionRaw);
            if (existingSession?.email === email && existingSession?.temporaryPassword) {
              const signInResult = await signInWithEmailAndPassword(
                auth,
                email,
                existingSession.temporaryPassword
              );
              await sendEmailVerification(signInResult.user, {
                url: buildVerificationRedirectUrl(existingActiveId),
                handleCodeInApp: true,
              });
              setSignupSessionId(existingActiveId);
      
              setSuccess("Ya iniciaste el proceso con este correo. Te reenviamos el link de verificacion.");
              return;
            }
          } catch {
            // La sesión guardada expiró o es inválida, continuar con flujo normal
          }
        }
      }

      // Pre-check: verificar si el email ya existe en la BD y limpiar huérfanos de Firebase
      try {
        const cleanupRes = await cleanupIncompleteFirebaseUser({ email });
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
        email,
        temporaryPassword
      );

      persistSignupSession({
        sessionId,
        emailValue: email,
        temporaryPassword,
      });
      setSignupSessionId(sessionId);

      await sendEmailVerification(firebaseCredentials.user, {
        url: buildVerificationRedirectUrl(sessionId),
        handleCodeInApp: true,
      });

      setSuccess(
        "Te enviamos un link de verificacion. Abre el correo y te redirigira a la pantalla para completar tu registro."
      );
    } catch (err) {
      console.error(err);
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
      setError("No se pudo reenviar el correo de verificación. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="w-1/2 toolsSection ">
        <Image
          src="/images/Logo-Red-De-Mujeres-notext.png"
          alt="Portada de la Red de Mujeres Academicas UNA"
          width={400}
          height={400}
          className="w-72 h-auto object-contain mx-auto mt-10"
          priority
        />
        <h1 className="text-3xl font-bold text-center text-[#E7473C]">
          Red de Mujeres Academicas e Investigadoras UNA
        </h1>
        <p className="text-center mt-5 px-10 text-gray-600 text-lg">
          Plataforma para la visibilizacion, colaboracion y apoyo entre
          mujeres academicas de la Universidad Nacional de Costa Rica.
        </p>
        <div className="flex justify-center mt-5 gap-5">
          {iconInstagram({ size: 24, color: "#8A192A" })}
          {iconFacebook({ size: 24, color: "#8A192A" })}
          {iconWhatsApp({ size: 24, color: "#8A192A" })}
        </div>
      </section>
      <section className="w-1/2 mainSection p-5 overflow-auto">
        <form
          className="flex flex-col gap-3 rounded p-4 px-5 w-full overflow-hidden"
          onSubmit={handleStartVerification}
        >
          <h2 className="text-2xl font-bold text-center text-white ">
            Paso 1: Verificar email
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success &&
          <div className = "flex flex-col gap-3">
            <div className="bg-green-200 border border-green-300 text-green-800 rounded-lg px-4 py-3 text-sm">
              {success}
            </div>

            <div className="bg-yellow-200 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-3 text-sm">
              📬 Si no ves el correo en los próximos minutos, revisa tu bandeja de spam o correo no deseado.
            </div>
            </div>
          }

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="email" className="font-semibold text-white">
              Correo Electronico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Correo Electronico"
              className="rounded border border-gray-300 px-3 py-2 w-full bg-white h-12"
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
            className="bg-white text-[#8A192A] w-full rounded hover:bg-gray-100 hover:cursor-pointer"
            onClick={handleResendVerification}
            disabled={loading || !email?.trim()}
          >
            Reenviar link de verificacion
          </Button>

          <hr className="border-white" />
          <Link href="/IniciarSesion" className="text-gray-200 hover:underline text-center">
            ¿Ya tienes una cuenta? <br /> Inicia sesion aqui
          </Link>
        </form>
      </section>
    </>
  );
}
