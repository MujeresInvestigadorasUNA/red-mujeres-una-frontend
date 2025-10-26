"use client";
import { iconClockwise, iconSearch, iconCamara } from "@/app/assets/icons";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createForumn, getUserForum } from "@/lib/api/forums";
import { useUser } from "@/app/contexts/UserContext";

export default function MiPerfil() {
    const { user } = useUser();
    const photoInputRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        profession: "",
        description: ""
    });

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handlePhotoClick = () => {
        photoInputRef.current.click(); // trigger hidden input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.profession || !form.description) {
            return toast.error("Por favor, complete todos los campos");
        }

        try {
            const response = await createForumn({ 
                user_id: user.id, 
                user_proffesion: form.profession, 
                user_description: form.description 
            });

            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al iniciar sesión");
            }
            toast.success("Perfil actualizado correctamente");
        } catch (err) {
            toast.warning("Error de conexión");
        }
    };

    const fetchUserForum = async () => {
        try {
            const response = await getUserForum({ user_id: user.id });
            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al obtener el foro");
            }
            setForm({
                name: data.user.name + " " + data.user.last_name || "",
                profession: data.user_proffesion || "",
                description: data.user_description || "",
            });
        } catch (err) {
            toast.warning("Error de conexión");
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchUserForum();
        }
    }, [user]);

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 justify-between">
                <div className="flex gap-10">
                    <div className="w-full">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            className="border-0 shadow-none p-0 font-bold w-full"
                            placeholder="Nombre"
                            value={form.name}
                            onChange={onChange}
                            style={{ fontSize: '2rem' }}
                        />
                        <Input
                            id="profession"
                            name="profession"
                            type="text"
                            className="text-gray-600 rounded border-0 shadow-none p-0 
                            w-full"
                            placeholder="Profesión o Especialidad"
                            value={form.profession}
                            onChange={onChange}
                            style={{ fontSize: '1rem' }}
                        />
                        <Textarea
                            id="description"
                            name="description"
                            className="text-gray-600 mt-3 w-full h-80 border 
                            rounded border-0 p-0 shadow-none resize-none"
                            placeholder="Descripción o Biografía"
                            value={form.description}
                            onChange={onChange}
                        ></Textarea>
                    </div>
                    <div>
                        <Input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            ref={photoInputRef}
                            className="hidden"
                        />
                        <Empty className="border border-dashed border-[#999] bg-[#f9f9f9]
                        h-100 w-100 hover:cursor-pointer hover:border-[#666]
                        hover:brightness-95 transition-all duration-200"
                            onClick={handlePhotoClick}>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    {iconCamara({ size: 48, color: "#999" })}
                                </EmptyMedia>
                                <EmptyTitle>Una Foto Profesional</EmptyTitle>
                                <EmptyDescription>
                                    Sube una foto profesional para que otros sepan quién eres.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                        {/* <Image
                            src="/images/jinette.png"
                            alt="jinette López"
                            width={1000}
                            height={1000}
                            className="object-cover rounded w-full h-100 w-100"
                        /> */}
                    </div>
                </div>
                <Button type="submit" className="bg-[#E7473C] text-white
                hover:bg-[#b0352c] hover:cursor-pointer">
                    Guardar Cambios
                </Button>
            </form>
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