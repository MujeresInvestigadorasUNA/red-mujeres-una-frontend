import Image from "next/image";
import Link from "next/link";

export default function IniciarSesion() {
    return (
        <main className="flex gap-13 flex-grow px-20 py-10 h-[100%]">
            <Image 
                src="/images/tool3.png" 
                alt="Portada de la Red de Mujeres Académicas UNA" 
                width={500} 
                height={300} 
                className="mt-5 h-90 object-cover rounded min-w-[40vw]" 
            />
            <form className="flex flex-col gap-3 w-full">
                <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
                <div>
                    <label htmlFor="correo-electronico" className="font-semibold">Correo Electrónico</label>
                    <input 
                        type="text" 
                        id="correo-electronico" 
                        placeholder="Correo Electrónico" 
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
                <button className="rounded bg-gray-800 text-white px-4 py-2">Iniciar Sesión</button>
                <Link href="/Registrarse" className="text-gray-400 hover:underline text-center">
                    ¿No tienes una cuenta? <br /> Regístrate aquí
                </Link>
            </form>
        </main>
    );
}