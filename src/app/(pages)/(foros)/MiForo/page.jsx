"use client";
import { iconPen } from "@/app/assets/icons";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserInfo, updateUser } from "@/lib/api/auth";
import { useUser } from "@/app/contexts/UserContext";
import { capitalizeWords } from "@/app/assets/utils";

export default function MiForo() {
    const { user, accessToken } = useUser();
    const blobContainerSasToken =
        process.env.NEXT_PUBLIC_BLOB_CONTAINER_IMAGE_SAS_TOKEN ||
        process.env.NEXT_PUBLIC_BLOB_CONTAINER_IMAGES_SAS_TOKEN ||
        "";

    const [form, setForm] = useState({
        name: "",
        profession: "",
        description: "",
        photo: null,
    });

    const [userProfile, setUserProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        userTypeId: null,
        userProfession: "",
        photo: null,
        isPublic: false,
    });

    const withBlobSasToken = (imageUrl) => {
        if (!imageUrl || !blobContainerSasToken) return imageUrl;
        if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:") || imageUrl.startsWith("/")) {
            return imageUrl;
        }
        if (!imageUrl.includes("blob.core.windows.net") || imageUrl.includes("sig=")) {
            return imageUrl;
        }

        const normalizedToken = blobContainerSasToken.startsWith("?")
            ? blobContainerSasToken.slice(1)
            : blobContainerSasToken;

        return imageUrl.includes("?")
            ? `${imageUrl}&${normalizedToken}`
            : `${imageUrl}?${normalizedToken}`;
    };

    const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.description) {
            return toast.error("Por favor, agrega una descripción del foro");
        }

        try {
            const response = await updateUser({
                id: user.id,
                first_name: userProfile.firstName,
                last_name: userProfile.lastName,
                email: userProfile.email,
                user_type_id: userProfile.userTypeId,
                user_profession: userProfile.userProfession,
                user_description: form.description,
                is_public: userProfile.isPublic,
                access_token: accessToken,
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
            const response = await getUserInfo({ user_id: user.id });
            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al obtener el foro");
            }

            const firstName = data.first_name || "";
            const lastName = data.last_name || "";
            const userProfession = data.user_profession || data.profession || "";

            setForm({
                name: `${firstName} ${lastName}`.trim(),
                profession: userProfession,
                description: data.user_description || "",
                photo: data.photo || null,
            });

            setUserProfile({
                firstName,
                lastName,
                email: data.email || user?.email || "",
                userTypeId: data.user_type_id || user?.user_type_id || null,
                userProfession,
                photo: data.photo || null,
                isPublic: data.is_public || false,
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
                            value={form.description}
                            placeholder="Escribe una breve descripción sobre ti..."
                            onChange={onChange}
                            className="text-gray-600 mt-3 w-full h-80 border 
                            rounded border-0 p-0 shadow-none resize-none pr-3"
                        ></Textarea>
                    </div>
                    <div className="w-full max-w-[320px]">
                        {form.photo && (
                            <Image
                                src={withBlobSasToken(form.photo)}
                                alt="Foto de perfil"
                                width={3000}
                                height={3000}
                                className="w-full h-[320px] rounded object-cover"
                            />
                        )}
                    </div>
                </div>
                <Button type="submit" className="bg-[#E7473C] text-white
                hover:bg-[#b0352c] hover:cursor-pointer rounded">
                    Guardar Cambios
                </Button>
            </form>
        </main>
    );
}