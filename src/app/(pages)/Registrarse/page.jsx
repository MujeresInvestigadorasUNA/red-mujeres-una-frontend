import Image from "next/image";
import Link from "next/link";

export default function Registrarse() {
    return (
        <main className="flex gap-13 flex-grow px-20 py-10 h-[100%]">
            <Image 
                src="/images/tool2.png" 
                alt="Portada de la Red de Mujeres Académicas UNA" 
                width={500} 
                height={300} 
                className="mt-5 h-90 object-cover rounded min-w-[40vw]" 
            />
            <form className="flex flex-col gap-3 w-full">
                <h1 className="text-2xl font-bold">Registrarse</h1>
                <div>
                    <label htmlFor="nombre-completo" className="font-semibold">Nombre Completo</label>
                    <input 
                        type="text" 
                        id="nombre-completo" 
                        placeholder="Nombre Completo" 
                        className="rounded border border-gray-300 px-3 py-2 w-full mt-2" 
                    />
                </div>
                <div>
                    <label htmlFor="contraseña" className="font-semibold mb-1">Contraseña</label>
                    <input 
                        type="password" 
                        id="contraseña" 
                        placeholder="Contraseña" 
                        className="rounded border border-gray-300 px-3 py-2 w-full mt-2" 
                    />
                </div>
                <div>
                    <label htmlFor="correo-electronico" className="font-semibold">Correo Electrónico</label>
                    <input 
                        type="email" 
                        id="correo-electronico" 
                        placeholder="Correo Electrónico" 
                        className="rounded border border-gray-300 px-3 py-2 w-full mt-2" 
                    />
                </div>
                <button className="rounded bg-gray-800 text-white px-4 py-2">Registrarse</button>
                <Link href="/IniciarSesion" className="text-gray-400 hover:underline text-center">
                    ¿Ya tienes una cuenta? <br /> Inicia sesión
                </Link>
            </form>
        </main>
    );
}