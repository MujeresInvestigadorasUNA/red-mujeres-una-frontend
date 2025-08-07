// app/(auth)/sign-in/page.tsx
import Link from 'next/link';
import { X } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="bg-neutral-50 flex flex-col items-center justify-center min-h-screen p-6">
      <Link href="/" className="absolute top-6 right-6 text-neutral-500 hover:text-black transition-colors" aria-label="Volver al inicio">
        <X size={24} />
      </Link>
      
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-semibold text-center text-zinc-900 mb-8">Iniciar Sesión</h2>
        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
              Correo Electrónico
            </label>
            <input id="email" name="email" type="email" required className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
              Contraseña
            </label>
            <input id="password" name="password" type="password" required className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <button type="submit" className="w-full mt-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Continuar
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-zinc-600 mt-8">
          ¿No tienes una cuenta?{' '}
          <Link href="/sign-up" className="font-medium text-blue-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}