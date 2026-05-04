"use client";
import { iconCalendar, iconEye, iconEyeSlash, iconPenSquare, iconReturn, iconSearch, iconTrash } from "@/app/assets/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
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

const gradients = [
    "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
    "bg-gradient-to-br from-[#c2372d] to-[#E7473C]",
    "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
    "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
    "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
    "bg-gradient-to-br from-[#E7473C] to-[#c2372d]",
];

export default function MisCursos({ params }) {
    const { curso: cursoId } = use(params);
    const [isLoading, setIsLoading] = useState(true);

    const [course, setCourse] = useState({
        title: "",
        taughtBy: "",
        description: "",
        modality: "",
        maxRegistrationDate: "",
        startDate: "",
        endDate: "",
        maxQuotas: 0,
        isPublic: false
    });

    const onChange = (e) => {
        setCourse({ ...course, [e.target.name]: e.target.value });
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
                    {/* Gradient Header Skeleton */}
                    <section className="bg-gray-200 p-8 md:p-12">
                        <Skeleton className="h-12 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <div className="flex flex-wrap gap-4 mt-6">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </section>
                    <section className="flex-grow px-6 md:px-20 py-10">
                        <Skeleton className="h-80 w-full rounded-lg mb-8" />
                        <div className="flex gap-10">
                            <div className="flex-1">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-40 w-full rounded" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-full rounded mt-5" />
                    </section>
                </div>
            ) : (
                <form className="flex flex-col" onSubmit={handleOnSubmit}>
                <section className="relative w-full">
                    {/* Gradient Header */}
                    <div className={`${gradients[(String(course.id || '').charCodeAt(0) || 0) % gradients.length] || gradients[0]} p-8 md:p-12 text-white relative`}>
                        <div className="max-w-4xl">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h1 className="text-4xl md:text-5xl font-bold mb-4 line-clamp-3">
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="Título del Curso"
                                            value={course.title}
                                            onChange={onChange}
                                            className="bg-white/20 text-white placeholder:text-white/70 border-0 shadow-none focus:outline-none focus:ring-2 focus:ring-white/30 text-3xl md:text-4xl font-bold p-0 mb-0"
                                        />
                                    </h1>
                                    <p className="text-lg opacity-90 mb-6">
                                        Impartido por: <span className="font-semibold">{course.taughtBy}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <div className="flex items-center space-x-2 text-white">
                                        <Switch
                                            id="isPublic"
                                            name="isPublic"
                                            checked={course.isPublic}
                                            onCheckedChange={handleOnPublicChange}
                                        />
                                        <Label htmlFor="isPublic" className="text-sm">
                                            {isPublicLabel}
                                            {isPublicIcon}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    {iconCalendar({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Inicio</p>
                                        <Input
                                            id="startDate"
                                            name="startDate"
                                            type="date"
                                            value={course.startDate}
                                            onChange={onChange}
                                            className="bg-white/20 text-white border-0 shadow-none p-0 text-sm font-semibold placeholder:text-white/70"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {iconCalendar({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Finalización</p>
                                        <Input
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            value={course.endDate}
                                            onChange={onChange}
                                            className="bg-white/20 text-white border-0 shadow-none p-0 text-sm font-semibold placeholder:text-white/70"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {iconCalendar({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Registro Máximo</p>
                                        <Input
                                            id="maxRegistrationDate"
                                            name="maxRegistrationDate"
                                            type="date"
                                            value={course.maxRegistrationDate}
                                            onChange={onChange}
                                            className="bg-white/20 text-white border-0 shadow-none p-0 text-sm font-semibold placeholder:text-white/70"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {iconSearch({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Cupos</p>
                                        <Input
                                            id="maxQuotas"
                                            name="maxQuotas"
                                            type="number"
                                            value={course.maxQuotas}
                                            onChange={onChange}
                                            className="bg-white/20 text-white border-0 shadow-none p-0 text-sm font-semibold placeholder:text-white/70 w-16"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-3">
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
                        {/* Back Button */}
                        <div className="absolute top-4 left-4 flex gap-4">
                            <Link 
                                href="/MisCursos" 
                                className="p-2 rounded-full
                                transition hover:cursor-pointer"
                                title="Go back to My Courses"
                            >
                                {iconReturn({})}
                            </Link>
                        </div>
                    </div>
                </section>
                <section className="flex-grow px-6 md:px-20 py-12">
                    {/* Description Section */}
                    <div className="max-w-4xl">
                        <div className="flex gap-3 items-center mb-4">
                            {iconPenSquare({})}
                            <h2 className="text-2xl font-bold">Descripción del Curso</h2>
                        </div>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Descripción del curso"
                            value={course.description}
                            onChange={onChange}
                            className="w-full border border-gray-300 rounded-lg p-4 resize-none min-h-[200px]"
                        />
                    </div>
                    <Button type="submit" className="bg-[#E7473C] text-white
                    hover:bg-[#b0352c] hover:cursor-pointer rounded w-full mt-8">
                        Guardar Cambios
                    </Button>
                </section>
                </form>
            )}
        </main>
    );
}