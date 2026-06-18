"use client";

import { useEffect, useState } from "react";
import {
  iconEye,
  iconEyeSlash,
  iconInstagram,
  iconFacebook,
  iconWhatsApp,
  iconReturn,
} from "../../assets/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import Image from "next/image";
import Link from "next/link";
import { registerUser } from "@/lib/api/auth";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  applyActionCode,
  checkActionCode,
  reload,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { auth, hasFirebaseConfig } from "@/lib/firebase/client";
import { useSearchParams } from "next/navigation";

export default function CompleteRegistrationForm() {
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validatingLink, setValidatingLink] = useState(true);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [signupSessionId, setSignupSessionId] = useState("");

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    const sessionIdFromUrl = searchParams.get("session") || "";

    if (!hasFirebaseConfig || !auth) {
      setError("Falta configurar Firebase para completar el registro.");
      setValidatingLink(false);
      return;
    }

    if (!sessionIdFromUrl) {
      setError("La sesion de registro no es valida. Inicia de nuevo desde el paso 1.");
      setValidatingLink(false);
      return;
    }

    const sessionRaw = localStorage.getItem(`signup_session_${sessionIdFromUrl}`);
    if (!sessionRaw) {
      setError("No se encontro la sesion de registro. Vuelve al paso 1 y solicita otro link.");
      setValidatingLink(false);
      return;
    }

    let sessionData = null;
    try {
      sessionData = JSON.parse(sessionRaw);
    } catch (err) {
      console.error(err);
      setError("La sesion de registro es invalida. Vuelve al paso 1.");
      setValidatingLink(false);
      return;
    }

    if (!sessionData?.email || !sessionData?.temporaryPassword) {
      setError("La sesion de registro esta incompleta. Vuelve al paso 1.");
      setValidatingLink(false);
      return;
    }

    setSignupSessionId(sessionIdFromUrl);
    setVerifiedEmail(sessionData.email);

    let isMounted = true;

    const validateAndApplyLink = async () => {
      setValidatingLink(true);
      setError(null);

      try {
        let verifiedEmailFromLink = sessionData.email;

        if (mode === "verifyEmail" && oobCode) {
          const actionInfo = await checkActionCode(auth, oobCode);
          verifiedEmailFromLink = actionInfo?.data?.email || sessionData.email;
          await applyActionCode(auth, oobCode);
        }

        if (!isMounted) {
          return;
        }

        if (verifiedEmailFromLink !== sessionData.email) {
          setError("El correo verificado no coincide con la sesion de registro.");
          setIsLinkValid(false);
          return;
        }

        setVerifiedEmail(sessionData.email);
        setIsLinkValid(true);
        setSuccess("Correo verificado correctamente. Completa tus datos para finalizar.");
      } catch (err) {
        console.error(err);
        if (!isMounted) {
          return;
        }
        setError("No se pudo validar este enlace. Solicita un nuevo link de verificacion.");
      } finally {
        if (isMounted) {
          setValidatingLink(false);
        }
      }
    };

    validateAndApplyLink();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!isLinkValid || !verifiedEmail) {
        setError("Primero debes validar un enlace de verificacion valido.");
        return;
      }

      if (!formData.firstName || !formData.lastName) {
        setError("Completa nombre y apellidos.");
        return;
      }

      if (!formData.password || !formData.confirmPassword) {
        setError("Completa la contrasena y su confirmacion.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Las contrasenas no coinciden.");
        return;
      }

      // Siempre re-autenticar justo antes de updatePassword para evitar auth/requires-recent-login
      const sessionRaw = signupSessionId
        ? localStorage.getItem(`signup_session_${signupSessionId}`)
        : null;
      const sessionData = sessionRaw ? JSON.parse(sessionRaw) : null;
      const temporaryPassword = sessionData?.temporaryPassword || "";

      if (!temporaryPassword) {
        setError("No se encontro sesion de registro. Vuelve al paso 1 y envia otro link.");
        return;
      }

      let firebaseUser;
      try {
        const signInResult = await signInWithEmailAndPassword(auth, verifiedEmail, temporaryPassword);
        firebaseUser = signInResult.user;
      } catch (signInErr) {
        if (signInErr?.code === "auth/invalid-credential") {
          if (signupSessionId) localStorage.removeItem(`signup_session_${signupSessionId}`);
          localStorage.removeItem("signup_active_session_id");
          setError("La sesion temporal de registro vencio o es invalida. Vuelve al paso 1 y solicita un nuevo link.");
          return;
        }
        throw signInErr;
      }

      await reload(firebaseUser);
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const tokenEmail = idTokenResult?.claims?.email || firebaseUser.email || "";
      const tokenVerified = Boolean(idTokenResult?.claims?.email_verified);

      if (!tokenVerified || !firebaseUser.emailVerified) {
        setError("El correo aun no figura verificado. Revisa el enlace e intenta de nuevo.");
        return;
      }

      if (tokenEmail !== verifiedEmail || firebaseUser.email !== verifiedEmail) {
        setError("El correo autenticado no coincide con el correo verificado de la sesion.");
        return;
      }

      const firebaseIdToken = await firebaseUser.getIdToken();

      await updatePassword(firebaseUser, formData.password);

      const response = await registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: verifiedEmail,
        password: formData.password,
        user_type_id: 1,
        firebase_id_token: firebaseIdToken,
      });

      if (!response.ok) {
        const data = await response.json();
        if (Array.isArray(data.detail)) {
          setError(data.detail.map((item) => item.msg).join(", "));
        } else {
          setError(data.detail || "No se pudo completar el registro.");
        }
        return;
      }

      if (signupSessionId) {
        localStorage.removeItem(`signup_session_${signupSessionId}`);
      }
      localStorage.removeItem("signup_active_session_id");
      await signOut(auth);
      setSuccess("Registro completado correctamente. Ya puedes iniciar sesion.");
      window.location.href = "/IniciarSesion";
    } catch (err) {
      console.error(err);
      if (err?.code === "auth/invalid-credential") {
        setError("Credenciales invalidas en Firebase. Repite el proceso desde el paso 1.");
        return;
      }
      setError("Ocurrio un error al completar el registro.");
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
          src="/images/Logo-Red-De-Mujeres-notext.png"
          alt="Portada de la Red de Mujeres Academicas UNA"
          width={400}
          height={400}
          className="w-72 h-auto object-contain mx-auto mt-10"
          priority
        />
        <h1 className="text-3xl font-bold text-center text-[#E7473C]">
          Red de Mujeres Academicas UNA
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
          onSubmit={handleCompleteRegistration}
        >
          <h2 className="text-2xl font-bold text-center text-white ">Paso 2: Completar registro</h2>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-emerald-200">{success}</p>}
          {validatingLink && <p className="text-white">Validando enlace de verificacion...</p>}

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="verifiedEmail" className="font-semibold text-white">
              Correo Electronico verificado
            </Label>
            <Input
              id="verifiedEmail"
              name="verifiedEmail"
              type="email"
              className="rounded border border-gray-300 px-3 py-2 w-full bg-white h-12"
              value={verifiedEmail}
              readOnly
              style={{ fontSize: "1rem" }}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="firstName" className="font-semibold text-white">
              Nombre
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Nombre"
              className="rounded border border-gray-300 px-3 py-2 w-full bg-white h-12"
              value={formData.firstName}
              onChange={handleFormChange}
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
              className="rounded border border-gray-300 px-3 py-2 w-full bg-white h-12"
              value={formData.lastName}
              onChange={handleFormChange}
              style={{ fontSize: "1rem" }}
            />
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="password" className="font-semibold text-white">
              Contrasena
            </Label>
            <InputGroup className="bg-white h-12 rounded">
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contrasena"
                value={formData.password}
                onChange={handleFormChange}
                style={{ fontSize: "1rem" }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword
                    ? iconEyeSlash({ size: 16, color: "#8A192A" })
                    : iconEye({ size: 16, color: "#8A192A" })}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="confirmPassword" className="font-semibold text-white">
              Confirmar Contrasena
            </Label>
            <InputGroup className="bg-white h-12 rounded">
              <InputGroupInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Contrasena"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                style={{ fontSize: "1rem" }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
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
            className="bg-[#B62116] text-white w-full rounded hover:bg-[#8A192A] hover:cursor-pointer"
            disabled={loading || validatingLink || !isLinkValid}
          >
            {loading ? <Spinner /> : "Completar registro"}
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
