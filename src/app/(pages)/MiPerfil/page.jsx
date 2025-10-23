"use client";
import { iconClockwise, iconSearch } from "@/app/assets/icons";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MiPerfil() {
    const [forumName, setForumName] = useState("");
    const [subForumName, setSubForumName] = useState("");

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <section className="flex gap-20 justify-between">
                <div>
                    <input
                        type="text"
                        className="text-2xl font-bold w-full rounded"
                        placeholder="Nombre del Foro"
                        value={forumName}
                        onChange={(e) => setForumName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="text-gray-600 rounded"
                        placeholder="Nombre del Subforo"
                        value={subForumName}
                        onChange={(e) => setSubForumName(e.target.value)}
                    />
                    <textarea 
                        className="text-gray-600 mt-3 w-full h-80 border rounded border-gray-300" 
                        placeholder="Descripción del Subforo"
                    ></textarea>
                </div>
                <Image
                    src="/images/jinette.png"
                    alt="jinette López"
                    width={300}
                    height={300}
                    className="object-cover rounded w-full h-100 mt-5 max-w-100 
                    max-h-[300px] min-h-[300px] mb-3"
                />
            </section>
            <section>
                <h2 className="text-2xl font-bold mt-10 mb-5"> Mis Investigaciones </h2>
                <div className="flex items-stretch gap-3 mb-3">
                    <button className="bg-[#E7473C] text-white p-2 rounded text-nowrap px-4
                    hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                        Añadir Investigación
                    </button>
                    <span>
                        <select
                            defaultValue=""
                            className="bg-[#ffffff] py-2 px-2 rounded h-full border border-gray-300"
                        >
                            <option value="" disabled>Filtrar Por</option>
                            <option value="temas">Temas</option>
                        </select>
                    </span>
                    <span className="flex w-full">
                        <input
                            type="search"
                            placeholder="Buscar..."
                            className="bg-[#ffffff] py-2 px-3 rounded-l w-full border border-gray-300"
                        />
                        <button className="bg-[#E7473C] text-white py-2 px-3 rounded-r text-sm 
                        hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                            {iconSearch({})}
                        </button>
                    </span>
                    <button className="bg-[#E7473C] text-white py-2 px-3 rounded
                    hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                        {iconClockwise({})}
                    </button>
                </div>
                <div className="flex gap-5 flex-wrap mt-3">
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 
                            max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-bold mt-10 mb-5">Cursos Relacionados</h2>
                <div className="flex items-stretch gap-3 mb-3">
                    <button className="bg-[#E7473C] text-white p-2 rounded text-nowrap px-4
                    hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                        Añadir Curso
                    </button>
                    <span>
                        <select
                            defaultValue=""
                            className="bg-[#ffffff] py-2 px-2 rounded h-full border border-gray-300"
                        >
                            <option value="" disabled>Filtrar Por</option>
                            <option value="temas">Temas</option>
                        </select>
                    </span>
                    <span className="flex w-full">
                        <input
                            type="search"
                            placeholder="Buscar..."
                            className="bg-[#ffffff] py-2 px-3 rounded-l w-full border border-gray-300"
                        />
                        <button className="bg-[#E7473C] text-white py-2 px-3 rounded-r text-sm 
                        hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                            {iconSearch({})}
                        </button>
                    </span>
                    <button className="bg-[#E7473C] text-white py-2 px-3 rounded
                    hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                        {iconClockwise({})}
                    </button>
                </div>
                <div className="flex gap-5 flex-wrap mt-3">
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-bold mt-10 mb-5">Menciones</h2>
                <div className="flex items-stretch gap-3 mb-3">
                    <span>
                        <select
                            defaultValue=""
                            className="bg-[#ffffff] py-2 px-2 rounded h-full border border-gray-300"
                        >
                            <option value="" disabled>Filtrar Por</option>
                            <option value="temas">Temas</option>
                        </select>
                    </span>
                    <span className="flex w-full">
                        <input
                            type="search"
                            placeholder="Buscar..."
                            className="bg-[#ffffff] py-2 px-3 rounded-l w-full border border-gray-300"
                        />
                        <button className="bg-[#E7473C] text-white py-2 px-3 rounded-r text-sm 
                        hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                            {iconSearch({})}
                        </button>
                    </span>
                    <button className="bg-[#E7473C] text-white py-2 px-3 rounded
                    hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                        {iconClockwise({})}
                    </button>
                </div>
                <div className="flex gap-5 flex-wrap mt-3">
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}