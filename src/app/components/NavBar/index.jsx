import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="flex justify-between items-center px-5 py-3 shadow border-b border-[#ddd] sticky top-0 bg-white z-10">
            <Link href="/" className="font-bold text-[#900]">Red De Mujeres Académicas UNA</Link>
            <ul className="flex gap-10">
                <li>
                    <Link href="/Foros">Foros</Link>
                </li>
                <li>
                    <Link href="/Cursos">Cursos</Link>
                </li>
                <li>
                    <Link href="/Investigaciones">Investigaciones</Link>
                </li>
            </ul>
            <Link href="/IniciarSesion" className="bg-gray-800 text-white px-3 py-1 rounded">Iniciar Sesión</Link>
        </nav>
    )
}