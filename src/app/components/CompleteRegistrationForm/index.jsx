"use client";

import { useEffect, useState } from "react";
import {
  iconEye,
  iconEyeSlash,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
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

  const [loading, setLoading] = useState(false);
  const [validatingLink, setValidatingLink] = useState(true);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [signupSessionId, setSignupSessionId] = useState("");

  const isValidName = (value) => {
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[\s'’-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(value.trim());
  };

  const isStrongPassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrengthText = (password) => {
    if (!password) return "Ingresa una contraseña";
    if (password.length < 6) return `Mínimo 6 caracteres (${password.length}/6)`;
    return "Contraseña válida";
  };

  const getPasswordStrengthColor = (password) => {
    if (!password) return "text-gray-500";
    if (password.length < 6) return "text-red-600";
    return "text-green-600";
  };

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    const sessionIdFromUrl = searchParams.get("session") || "";

    if (!hasFirebaseConfig || !auth) {
      toast.error("Falta configurar Firebase para completar el registro.");
      setValidatingLink(false);
      return;
    }

    if (!sessionIdFromUrl) {
      toast.error("La sesión de registro no es válida. Inicia de nuevo desde el paso 1.");
      setValidatingLink(false);
      return;
    }

    const sessionRaw = localStorage.getItem(`signup_session_${sessionIdFromUrl}`);
    if (!sessionRaw) {
      toast.error("No se encontró la sesión de registro. Vuelve al paso 1 y solicita otro link.");
      setValidatingLink(false);
      return;
    }

    let sessionData = null;
    try {
      sessionData = JSON.parse(sessionRaw);
    } catch (err) {
      console.error(err);
      toast.error("La sesión de registro es inválida. Vuelve al paso 1.");
      setValidatingLink(false);
      return;
    }

    if (!sessionData?.email || !sessionData?.temporaryPassword) {
      toast.error("La sesión de registro está incompleta. Vuelve al paso 1.");
      setValidatingLink(false);
      return;
    }

    setSignupSessionId(sessionIdFromUrl);
    setVerifiedEmail(sessionData.email);

    let isMounted = true;

    const validateAndApplyLink = async () => {
      setValidatingLink(true);

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
          toast.error("El correo verificado no coincide con la sesión de registro.");
          setIsLinkValid(false);
          return;
        }

        setVerifiedEmail(sessionData.email);
        setIsLinkValid(true);
        toast.success("Correo verificado correctamente. Completa tus datos para finalizar.");
      } catch (err) {
        console.error(err);
        if (!isMounted) {
          return;
        }
        toast.error("No se pudo validar este enlace. Solicita un nuevo link de verificación.");
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

    try {
      if (!isLinkValid || !verifiedEmail) {
        toast.error("Primero debes validar un enlace de verificación válido.");
        return;
      }

      if (!formData.firstName || !formData.lastName) {
        toast.error("Completa nombre y apellidos.");
        return;
      }

      if (!isValidName(formData.firstName)) {
        toast.error("El nombre no puede contener números ni caracteres inválidos.");
        return;
      }

      if (!isValidName(formData.lastName)) {
        toast.error("Los apellidos no pueden contener números ni caracteres inválidos.");
        return;
      }

      if (!formData.password || !formData.confirmPassword) {
        toast.error("Completa la contraseña y su confirmación.");
        return;
      }

      if (!isStrongPassword(formData.password)) {
        toast.error("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden.");
        return;
      }

      // Siempre re-autenticar justo antes de updatePassword para evitar auth/requires-recent-login
      const sessionRaw = signupSessionId
        ? localStorage.getItem(`signup_session_${signupSessionId}`)
        : null;
      const sessionData = sessionRaw ? JSON.parse(sessionRaw) : null;
      const temporaryPassword = sessionData?.temporaryPassword || "";

      if (!temporaryPassword) {
        toast.error("No se encontró sesión de registro. Vuelve al paso 1 y envía otro link.");
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
          toast.error("La sesión temporal de registro venció o es inválida. Vuelve al paso 1 y solicita un nuevo link.");
          return;
        }
        throw signInErr;
      }

      await reload(firebaseUser);
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const tokenEmail = idTokenResult?.claims?.email || firebaseUser.email || "";
      const tokenVerified = Boolean(idTokenResult?.claims?.email_verified);

      if (!tokenVerified || !firebaseUser.emailVerified) {
        toast.error("El correo aún no figura verificado. Revisa el enlace e intenta de nuevo.");
        return;
      }

      if (tokenEmail !== verifiedEmail || firebaseUser.email !== verifiedEmail) {
        toast.error("El correo autenticado no coincide con el correo verificado de la sesión.");
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
          toast.error(data.detail.map((item) => item.msg).join(", "));
        } else {
          toast.error(data.detail || "No se pudo completar el registro.");
        }
        return;
      }

      if (signupSessionId) {
        localStorage.removeItem(`signup_session_${signupSessionId}`);
      }
      localStorage.removeItem("signup_active_session_id");
      await signOut(auth);
      toast.success("Registro completado correctamente. Ya puedes iniciar sesión.");
      window.location.href = "/IniciarSesion";
    } catch (err) {
      console.error(err);
      if (err?.code === "auth/invalid-credential") {
        toast.error("Credenciales inválidas en Firebase. Repite el proceso desde el paso 1.");
        return;
      }
      toast.error("Ocurrió un error al completar el registro.");
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

      <form className="flex flex-col gap-4 w-full" onSubmit={handleCompleteRegistration}>
        <h2 className="text-xl font-bold text-center text-gray-800">
          Completar Registro
        </h2>

        {validatingLink && (
          <div className="flex items-center gap-2.5 w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">Validando enlace de verificación...</p>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label htmlFor="verifiedEmail" className="font-semibold text-gray-700 text-sm">
            Correo Electrónico Verificado
          </Label>
          <Input
            id="verifiedEmail"
            name="verifiedEmail"
            type="email"
            className="h-11 rounded-lg border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            value={verifiedEmail}
            readOnly
            disabled
            style={{ fontSize: "1rem" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="firstName" className="font-semibold text-gray-700 text-sm">
            Nombre
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Nombre"
            className="h-11 rounded-lg border-gray-200"
            value={formData.firstName}
            onChange={handleFormChange}
            style={{ fontSize: "1rem" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="lastName" className="font-semibold text-gray-700 text-sm">
            Apellidos
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Apellidos"
            className="h-11 rounded-lg border-gray-200"
            value={formData.lastName}
            onChange={handleFormChange}
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
              placeholder="Mínimo 6 caracteres"
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
          <p className={`text-xs ${getPasswordStrengthColor(formData.password)}`}>
            {getPasswordStrengthText(formData.password)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="confirmPassword" className="font-semibold text-gray-700 text-sm">
            Confirmar Contraseña
          </Label>
          <InputGroup className="h-11 rounded-lg border-gray-200">
            <InputGroupInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
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
          className="bg-[#C0392B] text-white w-full h-11 rounded-lg hover:bg-[#8A192A] hover:cursor-pointer font-semibold"
          disabled={loading || validatingLink || !isLinkValid}
        >
          {loading ? <Spinner /> : "Completar Registro"}
        </Button>

        <div className="border-t border-gray-100 pt-4 text-center">
          <Link href="/IniciarSesion" className="text-sm text-gray-500 hover:text-[#C0392B] transition">
            ¿Ya tienes una cuenta? <span className="font-semibold text-[#C0392B]">Inicia sesión aquí</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
