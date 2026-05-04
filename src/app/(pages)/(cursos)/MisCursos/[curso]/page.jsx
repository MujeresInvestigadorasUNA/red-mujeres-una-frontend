"use client";
import { iconBackgroundImage, iconCalendar, iconEye, iconEyeSlash, iconPenSquare, iconReturn, iconSearch, iconTrash } from "@/app/assets/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { deleteCourse, getCourseById, updateCourse } from "@/lib/api/courses";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link";

export default function MisCursos({ params }) {
    const photoInputRef = useRef(null);
    const { curso: cursoId } = use(params);
    const [isLoading, setIsLoading] = useState(true);

    const [date, setDate] = useState(
        new Date(2025, 5, 12)
    );

    const [course, setCourse] = useState({
        title: "",
        taughtBy: "",
        photo: '/images/curso1.png',
        description: "",
        modality: "",
        maxRegistrationDate: "",
        startDate: "",
        endDate: "",
        maxQuotas: 0,
        isPublic: false
    });

    const onChange = (e) => {
        if (e.target.name === "photo") {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log(reader.result);
                    setCourse({ ...course, photo: reader.result }); // reader.result is base64
                };

                reader.readAsDataURL(file); // converts to base64
            }
        } else {
            setCourse({ ...course, [e.target.name]: e.target.value });
        }
    };

    const handlePhotoClick = () => {
        photoInputRef.current.click(); // trigger hidden input
    };

    const [isPublicLabel, setIsPublicLabel] = useState("Foro Privado");
    const [isPublicIcon, setIsPublicIcon] = useState(iconEyeSlash({ color: "#999" }));
    const handleOnPublicChange = (checked) => {
        setCourse({ ...course, isPublic: checked });
        if (checked) {
            setIsPublicLabel("Foro Público");
            setIsPublicIcon(iconEye({ color: "#E7473C" }));
        } else {
            setIsPublicLabel("Foro Privado");
            setIsPublicIcon(iconEyeSlash({ color: "#999" }));
        }
    };

    useEffect(() => {
        if (course.isPublic) {
            setIsPublicLabel("Foro Público");
            setIsPublicIcon(iconEye({ color: "#E7473C" }));
        } else {
            setIsPublicLabel("Foro Privado");
            setIsPublicIcon(iconEyeSlash({ color: "#999" }));
        }
    }, [course.isPublic]);

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        if (!course.title || !course.description || !course.startDate || !course.endDate
            || !course.maxRegistrationDate || !course.maxQuotas
        ) {
            toast.warning("Por favor, complete todos los campos requeridos.");
            return;
        }

        try {
            const response = await updateCourse({
                user_id: cursoId,
                title: course.title,
                photo: course.photo,
                description: course.description,
                modality: course.modality,
                max_registration_date: course.maxRegistrationDate,
                initial_date: course.startDate,
                final_date: course.endDate,
                max_quotas: course.maxQuotas,
                is_public: course.isPublic
            });
            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al actualizar el curso.");
            }
            toast.success("Curso actualizado correctamente!!");
        } catch (error) {
            toast.error("Error al actualizar el curso. Intente nuevamente.");
        }
    }

    const fetchCourseData = async () => {
        console.log("Fetching course data for ID:", cursoId);
        if (!cursoId) return;
        try {
            setIsLoading(true);
            const response = await getCourseById({ course_id: cursoId });
            const data = await response.json();
            if (!response.ok) {
                toast.warning(data.detail?.[0]?.msg || "Error al obtener los datos del curso.");
                setIsLoading(false);
                return;
            }
            setCourse({
                title: data.title || "Título del Curso",
                taughtBy: data.user.first_name + " " + data.user.last_name || "Nombre del Instructor",
                photo: data.photo || "/images/defaultCourse.webp",
                description: data.description || "Descripción del curso no disponible.",
                modality: data.modality || "no disponible",
                maxRegistrationDate: data.max_registration_date || "no disponible",
                startDate: data.initial_date || "no disponible",
                endDate: data.final_date || "no disponible",
                maxQuotas: data.max_quotas || 0,
                isPublic: data.is_public || false
            });
            setIsLoading(false);
        } catch (error) {
            toast.error("Error al obtener los datos del curso. Intente nuevamente.");
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (cursoId) {
            fetchCourseData();
        }
    }, [cursoId]);

    const handleOnDelete = async () => {
        try {
            const response = await deleteCourse({ course_id: cursoId });
            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al eliminar el curso.");
            }
            toast.success("Curso eliminado correctamente!!");
            window.location.href = "/MisCursos";
        }
        catch (error) {
            toast.error("Error al eliminar el curso. Intente nuevamente.");
        }
    }

    return (
        <main className="flex-grow h-[100%]">
            {isLoading ? (
                <div className="flex flex-col">
                    <section className="relative w-full h-[400px]">
                        <Skeleton className="w-full h-full" />
                    </section>
                    <section className="flex-grow px-20 py-10 h-[100%]">
                        <div className="flex flex-col gap-4 mb-5">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-6 w-96 mt-3" />
                            <div className="flex flex-wrap gap-5">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                        </div>
                        <div className="flex gap-10 mt-8 bg-gray-100 p-5 rounded-lg">
                            <div className="flex-1 min-w-0">
                                <Skeleton className="h-6 w-32 mb-3" />
                                <Skeleton className="h-80 w-full rounded" />
                            </div>
                            <Skeleton className="h-96 w-80 rounded-lg flex-shrink-0" />
                        </div>
                        <Skeleton className="h-12 w-full rounded mt-5" />
                    </section>
                </div>
            ) : (
                <form className="flex flex-col" onSubmit={handleOnSubmit}>
                <section className="relative w-full h-[400px]">
                    <div className="relative w-full h-full">
                        <Image
                            src={course.photo}
                            alt="Curso 1"
                            fill
                            className="object-cover brightness-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    {/* Centered Input */}
                    <div className="absolute inset-0 flex flex-col gap-5 items-center justify-center">
                        <Input
                            id="title"
                            name="title"
                            placeholder="Título del Curso"
                            value={course.title}
                            onChange={onChange}
                            className="h-20 w-full text-white font-bold text-center border-0 shadow-none 
                            focus:outline-none focus:ring-0 focus:border-transparent"
                            style={{
                                fontSize: '3rem',
                                lineHeight: '1',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                            }}
                        />
                    </div>
                    <Input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        onChange={onChange}
                        className="hidden"
                    />

                    {/* Bottom-right icon */}
                    <div className="absolute bottom-4 right-4 flex gap-4">
                        <div className="flex items-center space-x-2 text-white">
                            <Switch
                                id="isPublic"
                                name="isPublic"
                                checked={course.isPublic}
                                onCheckedChange={handleOnPublicChange}
                            />
                            <Label htmlFor="isPublic">
                                {isPublicLabel}
                                {isPublicIcon}
                            </Label>
                        </div>
                        <Button
                            className="p-2 rounded-full shadow-lg 
                        bg-[#b0352c] hover:bg-[#9f2c2c] transition hover:cursor-pointer"
                            onClick={handlePhotoClick}
                            title="Change background"
                            type="button"
                        >
                            {iconBackgroundImage({})}
                        </Button>
                    </div>

                    {/* Top-right icon */}
                    <div className="absolute top-4 right-4 flex gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                            <Button 
                                className="p-2 rounded-full shadow-lg 
                                bg-[#b0352c] hover:bg-[#9f2c2c] transition hover:cursor-pointer"
                                title="Delete course"
                                type="button"
                            >
                                {iconTrash({})}
                            </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Eliminar Curso</DialogTitle>
                                <DialogDescription>
                                ¿Está seguro que desea eliminar este curso? Esta acción no se puede deshacer.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={handleOnDelete}>
                                    Eliminar
                                </Button>
                            </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Top-left icon */}
                    <div className="absolute top-4 left-4 flex gap-4">
                        <Link 
                            href="/MisCursos" 
                            className="bg-white p-2 rounded-full shadow-lg 
                            hover:bg-gray-100 transition hover:cursor-pointer"
                            title="Go back to My Courses"
                        >
                            {iconReturn({})}
                        </Link>
                    </div>

                </section>
                <section className="flex-grow px-20 py-10 h-[100%]">
                    <div className="flex flex-col gap-4 mb-5">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-bold text-wrap">
                                Datos del Curso
                            </h2>
                            <h3 className="text-gray-600 text-semibold text-wrap
                            text-sm">
                                Impartido por: {course.taughtBy}
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-5">
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                                {iconCalendar({ size: 12 })} Fecha Inicial:
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={course.startDate}
                                    onChange={onChange}
                                    className="w-auto border-0 shadow-none p-0"
                                />
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                                {iconCalendar({ size: 12 })} Fecha Final:
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={course.endDate}
                                    onChange={onChange}
                                    className="w-auto border-0 shadow-none p-0"
                                />
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                                {iconCalendar({ size: 12 })} Fecha Máxima de Inscripción:
                                <Input
                                    id="maxRegistrationDate"
                                    name="maxRegistrationDate"
                                    type="date"
                                    value={course.maxRegistrationDate}
                                    onChange={onChange}
                                    className="w-auto border-0 shadow-none p-0"
                                />
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                                {iconSearch({ size: 12 })} Cupos Disponibles:
                                <Input
                                    id="maxQuotas"
                                    name="maxQuotas"
                                    type="number"
                                    value={course.maxQuotas}
                                    onChange={onChange}
                                    className="border-0 shadow-none
                                    w-20"
                                />
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-10 mt-8 bg-gray-100 p-5 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <span className="flex gap-2 justify-start items-center">
                                {iconPenSquare({})}
                                <h5 className="font-bold">Descripción</h5>
                            </span>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Descripción del curso"
                                value={course.description}
                                onChange={onChange}
                                className="p-0 mt-3 border-0 shadow-none resize-none
                                min-h-[10rem] h-[92%]"
                                style={{ fontSize: '1rem' }}
                            />
                        </div>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            buttonVariant="ghost"
                            className="rounded-lg border [--cell-size:--spacing(11)] 
                            md:[--cell-size:--spacing(12)] flex-shrink-0"
                        />
                    </div>
                    <Button type="submit" className="bg-[#E7473C] text-white
                    hover:bg-[#b0352c] hover:cursor-pointer rounded w-full mt-5">
                        Guardar Cambios
                    </Button>
                </section>
                </form>
            )}
        </main>
    );
}