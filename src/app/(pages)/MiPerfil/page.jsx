"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { getUserInfo, updateUser, uploadProfilePicture } from "@/lib/api/auth";
import { useUser } from "@/app/contexts/UserContext";
import { toast } from "sonner";
import Image from "next/image";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { iconCamara, iconEye, iconEyeSlash } from "@/app/assets/icons";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

export default function MiPerfil() {
    const { user, accessToken, setUserData, logout } = useUser();
    const photoInputRef = useRef(null);
    const blobContainerSasToken =
        process.env.NEXT_PUBLIC_BLOB_CONTAINER_IMAGE_SAS_TOKEN ||
        process.env.NEXT_PUBLIC_BLOB_CONTAINER_IMAGES_SAS_TOKEN ||
        "";

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        userProfession: "",
        email: "",
        photo: null,
        isPublic: false,
        userDescription: "",
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const onChange = (e) => {
        if (e.target.name === "photo") {
            const file = e.target.files[0];
            if (file) {
                setForm((prev) => {
                    if (typeof prev.photo === "string" && prev.photo.startsWith("blob:")) {
                        URL.revokeObjectURL(prev.photo);
                    }
                    return { ...prev, photo: URL.createObjectURL(file) };
                });
                setPhotoFile(file);
            }
            return;
        }

        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoClick = () => {
        photoInputRef.current?.click();
    };

    const handleErasePhoto = () => {
        if (typeof form.photo === "string" && form.photo.startsWith("blob:")) {
            URL.revokeObjectURL(form.photo);
        }
        setPhotoFile(null);
        setForm((prev) => ({ ...prev, photo: null }));
    };

    const handleOnPublicChange = (checked) => {
        setForm((prev) => ({ ...prev, isPublic: checked }));
    };

    const redirectToLoginOnExpiredToken = (status, detail) => {
        if (status !== 401 || detail !== "Token expired") {
            return false;
        }

        toast.error("Tu sesion ha expirado. Inicia sesion nuevamente.");
        logout("/IniciarSesion");
        return true;
    };

    const normalizeTextField = (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return "";

        return `${trimmedValue.charAt(0).toUpperCase()}${trimmedValue.slice(1)}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalizedForm = {
            ...form,
            firstName: normalizeTextField(form.firstName),
            lastName: normalizeTextField(form.lastName),
            userProfession: normalizeTextField(form.userProfession),
        };

        setForm(normalizedForm);

        // Basic form validation
        if (
            !normalizedForm.firstName ||
            !normalizedForm.lastName ||
            !normalizedForm.email ||
            !normalizedForm.userProfession
        ) {
            toast.error("Por favor, complete todos los campos requeridos");
            return;
        }

        try {
            const response = await updateUser({
                id: user.id,
                first_name: normalizedForm.firstName,
                last_name: normalizedForm.lastName,
                user_profession: normalizedForm.userProfession,
                user_description: normalizedForm.userDescription,
                is_public: normalizedForm.isPublic,
                email: normalizedForm.email,
                user_type_id: user.user_type_id,
                access_token: accessToken,
            });

            if (!response.ok) {
                const data = await response.json();

                if (redirectToLoginOnExpiredToken(response.status, data.detail)) {
                    return;
                }

                return toast.warning(data.detail?.[0]?.msg || "Error al guardar los cambios");
            }

            if (photoFile) {
                const uploadResponse = await uploadProfilePicture({
                    id: user.id,
                    file: photoFile,
                    access_token: accessToken,
                });

                if (!uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();

                    if (redirectToLoginOnExpiredToken(uploadResponse.status, uploadData.detail)) {
                        return;
                    }

                    return toast.warning(uploadData.detail?.[0]?.msg || "Error al actualizar la foto de perfil");
                }
            }

            const latestData = await fetchUserInfo();

            setUserData({
                id: user.id,
                first_name: latestData?.first_name || normalizedForm.firstName,
                last_name: latestData?.last_name || normalizedForm.lastName,
                user_profession: latestData?.user_profession || normalizedForm.userProfession,
                user_description: latestData?.user_description || normalizedForm.userDescription,
                is_public: latestData?.is_public ?? normalizedForm.isPublic,
                photo: latestData?.photo || normalizedForm.photo,
                email: latestData?.email || normalizedForm.email,
                user_type_id: latestData?.user_type_id || user.user_type_id,
            });
            toast.success("Perfil actualizado correctamente");
        } catch (err) {
            console.error(err);
            toast.warning("Error de conexión");
        }
    };

    const fetchUserInfo = async () => {
        try {
            setIsLoading(true);
            const response = await getUserInfo({ user_id: user.id, access_token: accessToken });
            const data = await response.json();
            if (!response.ok) {
                toast.warning(data.detail?.[0]?.msg || "Error al obtener la información del usuario");
                setIsLoading(false);
                return null;
            }
            setPhotoFile(null);
            setForm({
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                userProfession: data.user_profession || data.profession || "",
                email: data.email || "",
                photo: data.photo || null,
                isPublic: data.is_public || false,
                userDescription: data.user_description || "",
            });
            setIsLoading(false);
            return data;
        } catch (err) {
            toast.warning("Error de conexión");
            setIsLoading(false);
            return null;
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        fetchUserInfo();
    }, [user, accessToken]);

    useEffect(() => {
        return () => {
            if (typeof form.photo === "string" && form.photo.startsWith("blob:")) {
                URL.revokeObjectURL(form.photo);
            }
        };
    }, [form.photo]);

    const isPublicLabel = form.isPublic ? "Foro Público" : "Foro Privado";
    const isPublicIcon = form.isPublic
        ? iconEye({ color: "#E7473C" })
        : iconEyeSlash({ color: "#999" });

    return (
        <main className="flex mainSection pb-20 pt-10 px-5 md:px-10">
            {isLoading ? (
                <div className="flex flex-col gap-6 w-full max-w-5xl m-auto">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-start">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="grid w-full gap-3">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-12 w-full rounded" />
                                </div>
                                <div className="grid w-full gap-3">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-12 w-full rounded" />
                                </div>
                            </div>

                            <div className="grid w-full gap-3">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-12 w-full rounded" />
                            </div>

                            <div className="grid w-full gap-3">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-12 w-full rounded" />
                            </div>

                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </div>

                        <div className="w-full">
                            <Skeleton className="h-[320px] w-full rounded" />
                        </div>
                    </div>

                    <Skeleton className="h-8 w-full rounded" />
                </div>
            ) : (
                <form className="flex flex-col gap-6 w-full max-w-5xl m-auto" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-start">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="grid w-full gap-3">
                                <Label htmlFor="firstName" className="font-semibold text-white text-md">
                                    Nombre
                                </Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Nombre"
                                    type="text"
                                    value={form.firstName}
                                    onChange={onChange}
                                    required
                                    className="bg-white h-12 rounded"
                                    style={{ fontSize: "1rem" }}
                                />
                            </div>
                            <div className="grid w-full items-center gap-3">
                                <Label htmlFor="lastName" className="font-semibold text-white text-md">
                                    Apellidos
                                </Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Apellidos"
                                    type="text"
                                    value={form.lastName}
                                    onChange={onChange}
                                    required
                                    className="bg-white h-12 rounded"
                                    style={{ fontSize: "1rem" }}
                                />
                            </div>
                        </div>

                        <div className="grid w-full items-center gap-3">
                            <Label htmlFor="userProfession" className="font-semibold text-white text-md">
                                Profesión
                            </Label>
                            <Input
                                id="userProfession"
                                name="userProfession"
                                placeholder="Profesión"
                                type="text"
                                value={form.userProfession}
                                onChange={onChange}
                                required
                                className="bg-white h-12 rounded"
                                style={{ fontSize: "1rem" }}
                            />
                        </div>

                        <div className="grid w-full items-center gap-3">
                            <Label htmlFor="email" className="font-semibold text-white text-md">
                                Correo Electrónico
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                placeholder="Correo Electrónico"
                                type="email"
                                value={form.email}
                                onChange={onChange}
                                required
                                className="bg-white h-12 rounded"
                                style={{ fontSize: "1rem" }}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="isPublic"
                                name="isPublic"
                                checked={form.isPublic}
                                onCheckedChange={handleOnPublicChange}
                            />
                            <Label htmlFor="isPublic" className="text-white flex items-center gap-1">
                                {isPublicLabel}
                                {isPublicIcon}
                            </Label>
                        </div>
                    </div>

                    <div className="w-full">
                        <Input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            ref={photoInputRef}
                            onChange={onChange}
                            className="hidden"
                        />
                        {!form.photo && (
                            <Empty
                                className="border border-dashed border-[#999] bg-[#f9f9f9] h-[320px] w-full hover:cursor-pointer hover:border-[#666] hover:brightness-95 transition-all duration-200"
                                onClick={handlePhotoClick}
                            >
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
                            <div className="relative inline-block w-full h-[320px] group">
                                <Image
                                    onClick={handlePhotoClick}
                                    src={withBlobSasToken(form.photo)}
                                    alt="Foto de perfil"
                                    width={3000}
                                    height={3000}
                                    className="w-full h-full rounded object-cover hover:cursor-pointer hover:brightness-95 transition-all duration-200"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={handleErasePhoto}
                                    className="absolute top-2 right-2 rounded-full w-6 h-6 p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:cursor-pointer hover:brightness-90"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <Button type="submit" className="bg-[#b62116] text-white hover:bg-red-700 transition hover:cursor-pointer">
                    Guardar Cambios
                </Button>
            </form>            )}        </main>
    );
}