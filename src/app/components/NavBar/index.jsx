import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="flex justify-between items-center px-5 py-2 sticky top-0 text-white z-10 mainSection">
            <Link href="/" className="font-bold">
                <Image 
                    src="/images/logo.png" 
                    alt="Logo" 
                    width={60} 
                    height={60} 
                    className="border-[#8A192A] border-3 rounded-full shadow"
                />
            </Link>
            <ul className="flex gap-10 text-[#F0F0F0]">
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
            <Link href="/IniciarSesion" className="bg-[#b62116] text-white px-3 py-1 rounded shadow">Iniciar Sesión</Link>
        </nav>
    )
}