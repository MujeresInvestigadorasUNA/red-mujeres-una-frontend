import Image from "next/image";
import Link from "next/link";

export default function Cursos() {
    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <h1 className="text-2xl font-bold">Cursos</h1>
            <p className="mt-3">
                Encuentra aquí los cursos que imparten cada una de las integrantes de la 
                Red de Mujeres Académicas, con su información relevante.
            </p>
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
        </main>
    );
}