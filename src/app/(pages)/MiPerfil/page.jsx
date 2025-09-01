import Image from "next/image";
import Link from "next/link";

export default function MiPerfil() {
    return (
        <main className="flex flex-grow h-[100%]">
            <form className="bg-gray-100 border-r border-gray-300 shadow p-5 max-w-[300px]">
                <h1 className="text-sm font-bold">Información Personal</h1>
                <p className="text-sm mt-2">Aquí puedes ver y editar tu información personal.</p>
                <div className="flex flex-col items-center">
                    <Image
                        src="/images/tatiana.png"
                        alt="Usuario"
                        width={1000}
                        height={1000}
                        className="rounded-full w-50 h-50 mt-3 object-cover "
                    />
                </div>
                <div className="mt-3 flex flex-col gap-5">
                    <span>
                        <label className="font-semibold">Nombre de Usuario</label>
                        <input type="text" placeholder="Nombre" className="border border-gray-300 p-2 rounded mt-2 w-full" />
                    </span>
                    <span>
                        <label className="font-semibold">Correo Electrónico</label>
                        <input type="text" placeholder="Correo Electrónico" className="border border-gray-300 p-2 rounded mt-2 w-full" />
                    </span>
                    <span>
                        <label className="font-semibold">Contraseña</label>
                        <input type="text" placeholder="Contraseña" className="border border-gray-300 p-2 rounded mt-2 w-full" />
                    </span>
                    <button className="bg-gray-800 text-white p-2 rounded">Guardar Cambios</button>
                </div>
            </form>
            <div className="px-20 py-10 rounded w-full">
                <div>
                    <h1 className="text-2xl font-bold">Mis Cursos</h1>
                    <p className="mt-2">Aquí puedes ver y editar tus cursos inscritos.</p>
                </div>
                <div className="flex gap-4 mt-5">
                    <div className="w-full">
                        <label htmlFor="filtro-cursos" className="font-semibold">Filtrar Cursos:</label>
                        <input type="text" id="filtro-cursos" placeholder="Buscar..." className="rounded border border-gray-300 px-3 py-2 w-full mt-2" />
                    </div>
                    <div className="w-70">
                        <label htmlFor="filtro-cursos" className="font-semibold">Filtrar Por:</label>
                        <select id="filtro-cursos" className="rounded border border-gray-300 px-3 py-2 w-full mt-2">
                            <option value="todos">Todos</option>
                            <option value="temas">Temas</option>
                            <option value="autoras">Autoras</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-5 flex-wrap">
                    <div className="flex-grow">
                        <Image
                            src="/images/curso1.png"
                            alt="Foro 1"
                            width={200}
                            height={100}
                            className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/Cursos/pilar-lopez" className="text-md font-bold">Qué es la Fisiología Digestiva</Link>
                        <p className="text-gray-600">Descripción del foro de Pilar López.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/curso2.png"
                            alt="Foro 1"
                            width={200}
                            height={100}
                            className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/Cursos/tatiana-agular" className="text-md font-bold">Aprende de Nutrición y Tecnología</Link>
                        <p className="text-gray-600">Psicóloga.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/curso3.png"
                            alt="Foro 1"
                            width={200}
                            height={100}
                            className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/Cursos/maria-arguedas" className="text-md font-bold">Mejora Tus Hábitos de Vida</Link>
                        <p className="text-gray-600">Bioeticista.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/curso4.png"
                            alt="Foro 1"
                            width={200}
                            height={100}
                            className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/Cursos/maria-jose-chaves" className="text-md font-bold">Nutrición y Tecnología</Link>
                        <p className="text-gray-600">Investigadora del CIEM.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/curso5.png"
                            alt="Foro 1"
                            width={200}
                            height={100}
                            className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/Cursos/amanda-mesen" className="text-md font-bold">Hábitos de Vida Saludables</Link>
                        <p className="text-gray-600">Investigadora.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/curso6.png"
                            alt="Foro 1"
                            width={200}
                            height={100}
                            className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/Cursos/carolina-rojas" className="text-md font-bold">Fisiología Digestiva y Nutrición</Link>
                        <p className="text-gray-600">Directora, Investigadora.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}