"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import { getUserInfo, updateUser, uploadProfilePicture, getProfilePictureUrl } from "@/lib/api/auth";
import { useUser } from "@/app/contexts/UserContext";
import { toast } from "sonner";
import Image from "next/image";
import { Camera, Loader2, User } from "lucide-react";

export default function MiPerfil() {
    const { user, setUserData } = useUser();
    const photoInputRef = useRef(null);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        userProfession: "",
        email: "",
        photo: null,       // URL base del servidor (sin SAS)
        userDescription: "",
    });
    const [photoFile, setPhotoFile] = useState(null);       // archivo local seleccionado
    const [photoPreview, setPhotoPreview] = useState(null); // blob URL para preview local
    const [photoSignedUrl, setPhotoSignedUrl] = useState(null); // URL firmada del servidor
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSignedPhotoUrl = async (userId) => {
        try {
            const response = await getProfilePictureUrl({ user_id: userId });
            if (!response.ok) return;
            const data = await response.json();
            setPhotoSignedUrl(data?.url || data?.signed_url || data || null);
        } catch {
            // Si falla, simplemente no mostramos foto
        }
    };

    const onChange = (e) => {
        if (e.target.name === "photo") {
            const file = e.target.files[0];
            if (!file) return;
            if (photoPreview) URL.revokeObjectURL(photoPreview);
            const preview = URL.createObjectURL(file);
            setPhotoFile(file);
            setPhotoPreview(preview);
            return;
        }
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const normalizeTextField = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return "";
        return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
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

        if (!normalizedForm.firstName || !normalizedForm.lastName || !normalizedForm.userProfession) {
            toast.error("Por favor, complete todos los campos requeridos");
            return;
        }

        setIsSaving(true);
        try {
            const response = await updateUser({
                id: user.id,
                first_name: normalizedForm.firstName,
                last_name: normalizedForm.lastName,
                user_profession: normalizedForm.userProfession,
                user_description: normalizedForm.userDescription,
            });

            if (!response.ok) {
                const data = await response.json();
                toast.warning(data.detail?.[0]?.msg || "Error al guardar los cambios");
                return;
            }

            if (photoFile) {
                const uploadResponse = await uploadProfilePicture({ id: user.id, file: photoFile });
                if (!uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    toast.warning(uploadData.detail?.[0]?.msg || "Error al actualizar la foto de perfil");
                    return;
                }
                // Limpiar preview local y obtener la nueva URL firmada del servidor
                if (photoPreview) URL.revokeObjectURL(photoPreview);
                setPhotoFile(null);
                setPhotoPreview(null);
                await fetchSignedPhotoUrl(user.id);
            }

            const latestData = await fetchUserInfo(false);
            setUserData({
                id: user.id,
                first_name: latestData?.first_name || normalizedForm.firstName,
                last_name: latestData?.last_name || normalizedForm.lastName,
                user_profession: latestData?.user_profession || normalizedForm.userProfession,
                user_description: latestData?.user_description || normalizedForm.userDescription,
                photo: latestData?.photo || form.photo,
                email: latestData?.email || normalizedForm.email,
                user_type_id: latestData?.user_type_id || user.user_type_id,
            });
            toast.success("Perfil actualizado correctamente");
        } catch (err) {
            console.error(err);
            toast.warning("Error de conexión");
        } finally {
            setIsSaving(false);
        }
    };

    // showLoading controla si activamos el skeleton; en guardado no queremos mostrarlo
    const fetchUserInfo = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const response = await getUserInfo({ user_id: user.id });
            const data = await response.json();
            if (!response.ok) {
                toast.warning(data.detail?.[0]?.msg || "Error al obtener la información del usuario");
                return null;
            }
            setPhotoFile(null);
            setForm({
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                userProfession: data.user_profession || "",
                email: data.email || "",
                photo: data.photo || null,
                userDescription: data.user_description || "",
            });

            if (data.photo) {
                await fetchSignedPhotoUrl(user.id);
            } else {
                setPhotoSignedUrl(null);
            }

            return data;
        } catch (err) {
            toast.warning("Error de conexión");
            return null;
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        fetchUserInfo();
    }, [user?.id]);

    useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);

    // Preview local tiene prioridad; si no hay preview, mostramos la URL firmada del servidor
    const displayPhoto = photoPreview || photoSignedUrl || null;
    const fullName = `${form.firstName} ${form.lastName}`.trim();

    if (isLoading) {
        return (
            <main className="flex mainSection pb-20 pt-10 px-5 md:px-10">
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Skeleton className="w-32 h-32 rounded-full" />
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex mainSection pb-20 pt-10 px-5 md:px-10">
            <form
                className="w-full max-w-2xl mx-auto flex flex-col gap-8"
                onSubmit={handleSubmit}
            >
                {/* Foto de perfil */}
                <div className="flex flex-col items-center gap-3">
                    <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                        {displayPhoto ? (
                            <Image
                                src={displayPhoto}
                                alt="Foto de perfil"
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                                unoptimized={!!photoPreview}
                            />
                        ) : (
                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                <User className="w-14 h-14 text-white/80" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Camera className="w-7 h-7 text-white" />
                        </div>
                    </button>

                    {fullName && (
                        <p className="text-white text-xl font-semibold">{fullName}</p>
                    )}
                    {form.userProfession && (
                        <p className="text-white/80 text-sm">{form.userProfession}</p>
                    )}

                    <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        onChange={onChange}
                        className="hidden"
                    />
                </div>

                <Separator className="bg-white/10" />

                {/* Campos del formulario */}
                <div className="flex flex-col gap-5">
                    <div className="flex gap-4">
                        <div className="grid w-full gap-2">
                            <Label htmlFor="firstName" className="text-white/80 text-sm font-medium">
                                Nombre <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="Tu nombre"
                                type="text"
                                value={form.firstName}
                                onChange={onChange}
                                required
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11 rounded-lg focus:border-white/40 focus:bg-white/15"
                            />
                        </div>
                        <div className="grid w-full gap-2">
                            <Label htmlFor="lastName" className="text-white/80 text-sm font-medium">
                                Apellidos <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Tus apellidos"
                                type="text"
                                value={form.lastName}
                                onChange={onChange}
                                required
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11 rounded-lg focus:border-white/40 focus:bg-white/15"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="userProfession" className="text-white/80 text-sm font-medium">
                            Profesión <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="userProfession"
                            name="userProfession"
                            placeholder="Tu profesión"
                            type="text"
                            value={form.userProfession}
                            onChange={onChange}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11 rounded-lg focus:border-white/40 focus:bg-white/15"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                            Correo Electrónico
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            disabled
                            className="bg-white/5 border-white/10 text-white/70 h-11 rounded-lg cursor-not-allowed"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="userDescription" className="text-white/80 text-sm font-medium">
                            Descripción
                        </Label>
                        <Textarea
                            id="userDescription"
                            name="userDescription"
                            placeholder="Cuéntale a la comunidad un poco sobre ti..."
                            value={form.userDescription}
                            onChange={onChange}
                            rows={4}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-white/40 focus:bg-white/15 resize-none"
                        />
                    </div>

                    <Separator className="bg-white/10" />
                </div>

                <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 bg-[#b62116] hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-60"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        "Guardar Cambios"
                    )}
                </Button>
            </form>
        </main>
    );
}
