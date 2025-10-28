"use client";
import { iconClockwise, iconSearch, iconCamara, iconEye, iconEyeSlash, iconPen } from "@/app/assets/icons";
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
import { updateForum, getUserForum } from "@/lib/api/forums";
import { useUser } from "@/app/contexts/UserContext";
import { capitalizeWords } from "@/app/assets/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function MiForo() {
    const { user } = useUser();
    const photoInputRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        profession: "",
        description: "",
        photo: null,
        isPublic: false
    });

    const onChange = (e) => {
        if (e.target.name === "photo") {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log(reader.result);
                    setForm({ ...form, photo: reader.result }); // reader.result is base64
                };

                reader.readAsDataURL(file); // converts to base64
            }
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handlePhotoClick = () => {
        photoInputRef.current.click(); // trigger hidden input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.profession || !form.description) {
            return toast.error("Por favor, complete todos los campos");
        }

        try {
            const response = await updateForum({
                user_id: user.id,
                user_profession: form.profession,
                user_description: form.description,
                photo: form.photo,
                is_public: form.isPublic
            });

            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al actualizar el perfil");
            }
            toast.success("Foro actualizado correctamente");
        } catch (err) {
            console.error(err);
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
                name: data.user.first_name + " " + data.user.last_name || "",
                profession: data.user_profession || "",
                description: data.user_description || "",
                photo: data.user.photo || null,
                isPublic: data.is_public || false
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


    const [isPublicLabel, setIsPublicLabel] = useState("Foro Privado");
    const [isPublicIcon, setIsPublicIcon] = useState(iconEyeSlash({ color: "#999" }));
    const handleOnPublicChange = (checked) => {
        setForm({ ...form, isPublic: checked });
        if (checked) {
            setIsPublicLabel("Foro Público");
            setIsPublicIcon(iconEye({ color: "#E7473C" }));
        } else {
            setIsPublicLabel("Foro Privado");
            setIsPublicIcon(iconEyeSlash({ color: "#999" }));
        }
    };

    useEffect(() => {
        if (form.isPublic) {
            setIsPublicLabel("Foro Público");
            setIsPublicIcon(iconEye({ color: "#E7473C" }));
        } else {
            setIsPublicLabel("Foro Privado");
            setIsPublicIcon(iconEyeSlash({ color: "#999" }));
        }
    }, [form.isPublic]);

    const handleErasePhoto = () => {
        setForm({ ...form, photo: null });
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 justify-between">
                <div className="flex gap-10">
                    <div className="w-full">
                        <div className="flex justify-between">
                            <h2
                                className="text-2xl font-bold mb-3 flex gap-3 items-center group"
                                style={{ fontSize: '2rem' }}
                            >
                                {capitalizeWords(form.name) || "Nombre Completo"}

                                <Link
                                    href="/MiPerfil"
                                    className="text-gray-500 hover:text-gray-400 hover:cursor-pointer
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                    {iconPen({ size: 14 })}
                                </Link>
                            </h2>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isPublic"
                                    name="isPublic"
                                    checked={form.isPublic}
                                    onCheckedChange={handleOnPublicChange}
                                />
                                <Label htmlFor="isPublic">
                                    {isPublicLabel}
                                    {isPublicIcon}
                                </Label>
                            </div>
                        </div>
                        <h3
                            className="text-gray-600 font-semibold mb-1 flex gap-3 items-center group"
                            style={{ fontSize: '1rem' }}
                        >
                            {capitalizeWords(form.profession) || "Profesión u Ocupación"}

                            <Link
                                href="/MiPerfil"
                                className="text-gray-500 hover:text-gray-400 hover:cursor-pointer
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                                {iconPen({ size: 12 })}
                            </Link>
                        </h3>
                        <Textarea
                            id="description"
                            name="description"
                            className="text-gray-600 mt-3 w-full h-80 border 
                            rounded border-0 p-0 shadow-none resize-none pr-3"
                            value={form.description}
                            placeholder="Escribe una breve descripción sobre ti..."
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
                            onChange={onChange}
                            className="hidden"
                        />
                        {form.photo ? null : (
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
                        )}
                        {form.photo && (
                            <div className="relative inline-block w-100 h-100 min-w-100 min-h-100 group">
                                <Image
                                    onClick={handlePhotoClick}
                                    src={form.photo}
                                    alt="Foto de perfil"
                                    width={3000}
                                    height={3000}
                                    className="w-100 h-100 rounded object-cover
                                    hover:cursor-pointer hover:brightness-95
                                    transition-all duration-200"
                                />

                                {/* Hidden until hover */}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={handleErasePhoto}
                                    className="absolute top-2 right-2 rounded-full w-6 h-6 p-1 shadow-md 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    hover:cursor-pointer hover:brightness-90"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <Button type="submit" className="bg-[#E7473C] text-white
                hover:bg-[#b0352c] hover:cursor-pointer rounded">
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