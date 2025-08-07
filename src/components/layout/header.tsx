// app/components/layout/header.tsx
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg text-zinc-900">
          Red de Mujeres Académicas
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/foros" className="text-zinc-700 hover:text-blue-600 transition-colors">
            Foros
          </Link>
          <Link href="#" className="text-zinc-700 hover:text-blue-600 transition-colors">
            Cursos
          </Link>
          <Link href="#" className="text-zinc-700 hover:text-blue-600 transition-colors">
            Investigaciones
          </Link>
        </nav>
        <div>
          <Link href="/sign-in">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
              Iniciar Sesión
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}