// app/components/layout/footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200 mt-24 py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-semibold text-zinc-900 mb-4">Red de Mujeres Académicas</h3>
          <p className="text-zinc-500">© 2025 UNA</p>
        </div>
        <div>
          <h4 className="font-semibold text-zinc-800 mb-4">Foros</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-zinc-600 hover:text-blue-600">Más Vistos</Link></li>
            <li><Link href="#" className="text-zinc-600 hover:text-blue-600">Internos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-zinc-800 mb-4">Cursos</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-zinc-600 hover:text-blue-600">Más Solicitados</Link></li>
            <li><Link href="#" className="text-zinc-600 hover:text-blue-600">Públicos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-zinc-800 mb-4">Legal</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-zinc-600 hover:text-blue-600">Privacidad</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}