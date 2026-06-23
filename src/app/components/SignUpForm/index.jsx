"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, hasFirebaseConfig } from "@/lib/firebase/client";
import { cleanupIncompleteFirebaseUser, checkUserExists } from "@/lib/api/auth";

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
      toast.error("Completa el email para continuar.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      if (!hasFirebaseConfig || !auth) {
        toast.error("Falta configurar Firebase para la verificacion de correo.");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existsResponse = await checkUserExists({ email: normalizedEmail });
      if (!existsResponse.ok) {
        toast.error("No se pudo verificar si el correo ya existe. Intenta de nuevo más tarde.");
        return;
      }

      const existsData = await existsResponse.json();
      const emailExists = existsData?.exists ?? existsData?.status === "exists";
      if (emailExists) {
        toast.error("Este correo ya está registrado. Inicia sesión o utiliza otro correo.");
        return;
      }

      let signInMethods = [];
      try {
        signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      } catch (firebaseLookupError) {
        if (firebaseLookupError?.code !== "auth/user-not-found") {
          console.debug(firebaseLookupError);
        }
      }

      if (Array.isArray(signInMethods) && signInMethods.length > 0) {
        const cleanupRes = await cleanupIncompleteFirebaseUser({ email: normalizedEmail });
        if (!cleanupRes.ok) {
          toast.error("No se pudo verificar el estado previo de Firebase. Intenta de nuevo más tarde.");
          return;
        }

        const cleanupData = await cleanupRes.json();
        if (cleanupData.status === "cleaned") {
          toast.success("Se detectó un registro previo incompleto y se limpió. Puedes intentar el registro nuevamente.");
        } else if (cleanupData.status === "conflict") {
          toast.error("Este correo ya tiene una cuenta registrada. Inicia sesión en lugar de registrarte.");
          return;
        } else {
          toast.error("No se pudo limpiar el registro previo de Firebase. Intenta de nuevo con otro correo.");
          return;
        }
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
        normalizedEmail,
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
      console.debug(err);
      if (err?.code === "auth/email-already-in-use") {
        setError("Este correo ya está en uso. Si ya tienes una cuenta, inicia sesión.");
        return;
      }
      localStorage.removeItem("signup_active_session_id");
      toast.error(getFirebaseErrorMessage(err?.code));
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
        </div>
      </form>
    </div>
  );
}
