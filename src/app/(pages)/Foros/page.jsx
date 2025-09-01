import Image from "next/image";
import Link from "next/link";

export default function Foros() {
    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <h1 className="text-2xl font-bold">Foros</h1>
            <p className="mt-3">
                Encuentra aquí los foros de cada una de las integrantes de la 
                Red de Mujeres Académicas, con su información más relevante, sus logros 
                y sus investigaciones.
            </p>
            <div className="flex gap-4 mt-5">
                <div className="w-full">
                    <label htmlFor="filtro-foros" className="font-semibold">Filtrar Foros:</label>
                    <input type="text" id="filtro-foros" placeholder="Buscar..." className="rounded border border-gray-300 px-3 py-2 w-full mt-2" />
                </div>
                <div className="w-70">
                    <label htmlFor="filtro-foros" className="font-semibold">Filtrar Por:</label>
                    <select id="filtro-foros" className="rounded border border-gray-300 px-3 py-2 w-full mt-2">
                        <option value="todos">Todos</option>
                        <option value="temas">Temas</option>
                        <option value="autoras">Autoras</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-5 flex-wrap">
                <div className="flex-grow">
                    <Image 
                        src="/images/pilar.png" 
                        alt="Foro 1"
                        width={200} 
                        height={100} 
                        className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3" 
                    />
                    <Link href="/Foros/pilar-lopez" className="text-md font-bold">Pilar López</Link>
                    <p className="text-gray-600">Descripción del foro de Pilar López.</p>
                </div>
                <div className="flex-grow">
                    <Image 
                        src="/images/tatiana.png" 
                        alt="Foro 1"
                        width={200} 
                        height={100} 
                        className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3" 
                    />
                    <Link href="/Foros/tatiana-agular" className="text-md font-bold">Tatiana Agular</Link>
                    <p className="text-gray-600">Psicóloga.</p>
                </div>
                <div className="flex-grow">
                    <Image 
                        src="/images/mariaA.png" 
                        alt="Foro 1"
                        width={200} 
                        height={100} 
                        className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3" 
                    />
                    <Link href="/Foros/maria-arguedas" className="text-md font-bold">Maria Arguedas</Link>
                    <p className="text-gray-600">Bioeticista.</p>
                </div>
                <div className="flex-grow">
                    <Image 
                        src="/images/mariaJ.png" 
                        alt="Foro 1"
                        width={200} 
                        height={100} 
                        className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3" 
                    />
                    <Link href="/Foros/maria-jose-chaves" className="text-md font-bold">Maria Jose Chaves</Link>
                    <p className="text-gray-600">Investigadora del CIEM.</p>
                </div>
                <div className="flex-grow">
                    <Image 
                        src="/images/amanda.png" 
                        alt="Foro 1"
                        width={200} 
                        height={100} 
                        className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3" 
                    />
                    <Link href="/Foros/amanda-mesen" className="text-md font-bold">Amanda Mesén</Link>
                    <p className="text-gray-600">Investigadora.</p>
                </div>
                <div className="flex-grow">
                    <Image 
                        src="/images/carolina.png" 
                        alt="Foro 1"
                        width={200} 
                        height={100} 
                        className="object-cover rounded w-full h-100 mt-5 max-h-[200px] min-h-[200px] mb-3" 
                    />
                    <Link href="/Foros/carolina-rojas" className="text-md font-bold">Carolina Rojas</Link>
                    <p className="text-gray-600">Directora, Investigadora.</p>
                </div>
            </div>
        </main>
    );
}