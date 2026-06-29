import { Suspense } from "react";
import LoginForm from "@/app/components/LoginForm";

export default function IniciarSesion() {
  return (
    <main className="flex flex-col justify-center items-center bg-gray-100 min-h-screen gap-5 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
