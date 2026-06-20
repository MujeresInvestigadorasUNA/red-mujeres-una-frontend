"use client";
import { iconCalendar, iconPenSquare, iconReturn, iconTrash } from "@/app/assets/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteEvent, getEventById, updateEvent } from "@/lib/api/events";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

const gradients = [
    "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
    "bg-gradient-to-br from-[#c2372d] to-[#E7473C]",
    "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
    "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
    "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
    "bg-gradient-to-br from-[#E7473C] to-[#c2372d]",
];

export default function MiEvento({ params }) {
    const { evento: eventoId } = use(params);
    const [isLoading, setIsLoading] = useState(true);

    const [event, setEvent] = useState({
        title: "",
        organizer: "",
        description: "",
        modality: "",
        maxRegistrationDate: "",
        startDate: "",
        endDate: "",
    });

    const onChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        if (!event.title || !event.description || !event.startDate || !event.endDate || !event.maxRegistrationDate) {
            toast.warning("Por favor, complete todos los campos requeridos.");
            return;
        }

        try {
            const response = await updateEvent(eventoId, {
                title: event.title,
                description: event.description,
                modality: event.modality,
                max_registration_date: event.maxRegistrationDate,
                initial_date: event.startDate,
                final_date: event.endDate,
            });
            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al actualizar el evento.");
            }
            toast.success("Evento actualizado correctamente.");
        } catch (error) {
            toast.error("Error al actualizar el evento. Intente nuevamente.");
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventoId) return;
            try {
                setIsLoading(true);
                const response = await getEventById(eventoId);
                if (!response.ok) {
                    const data = await response.json();
                    toast.warning(data.detail?.[0]?.msg || "Error al obtener los datos del evento.");
                    setIsLoading(false);
                    return;
                }
                const data = await response.json();
                setEvent({
                    title: data.title || "",
                    organizer: data.user ? `${data.user.first_name} ${data.user.last_name}` : "",
                    description: data.description || "",
                    modality: data.modality || "",
                    maxRegistrationDate: data.max_registration_date || "",
                    startDate: data.initial_date || "",
                    endDate: data.final_date || "",
                });
            } catch (error) {
                toast.error("Error al obtener los datos del evento.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvent();
    }, [eventoId]);

    const handleOnDelete = async () => {
        try {
            const response = await deleteEvent(eventoId);
            const data = await response.json();
            if (!response.ok) {
                return toast.warning(data.detail?.[0]?.msg || "Error al eliminar el evento.");
            }
            toast.success("Evento eliminado correctamente.");
            window.location.href = "/MisEventos";
        } catch (error) {
            toast.error("Error al eliminar el evento.");
        }
    };

    return (
        <main className="flex-grow h-[100%]">
            {isLoading ? (
                <div className="flex flex-col">
                    <section className="bg-gray-200 p-8 md:p-12">
                        <Skeleton className="h-12 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <div className="flex flex-wrap gap-4 mt-6">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </section>
                    <section className="flex-grow px-6 md:px-20 py-10">
                        <Skeleton className="h-80 w-full rounded-lg mb-8" />
                        <Skeleton className="h-12 w-full rounded mt-5" />
                    </section>
                </div>
            ) : (
                <form className="flex flex-col" onSubmit={handleOnSubmit}>
                    <section className="relative w-full">
                        <div className={`${gradients[(String(eventoId || "").charCodeAt(0) || 0) % gradients.length] || gradients[0]} p-8 md:p-12 text-white relative`}>
                            <div className="max-w-4xl">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-4xl md:text-5xl font-bold mb-4 line-clamp-3">
                                            <Input
                                                id="title"
                                                name="title"
                                                placeholder="Título del Evento"
                                                value={event.title}
                                                onChange={onChange}
                                                className="bg-white/20 text-white placeholder:text-white/70 border-0 shadow-none focus:outline-none focus:ring-2 focus:ring-white/30 text-3xl md:text-4xl font-bold p-0 mb-0"
                                            />
                                        </h1>
                                        {event.organizer && (
                                            <p className="text-lg opacity-90 mb-6">
                                                Organizado por: <span className="font-semibold">{event.organizer}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        {iconCalendar({ size: 16 })}
                                        <div>
                                            <p className="opacity-75 text-xs">Inicio</p>
                                            <Input
                                                id="startDate"
                                                name="startDate"
                                                type="date"
                                                value={event.startDate}
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
                                                value={event.endDate}
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
                                                value={event.maxRegistrationDate}
                                                onChange={onChange}
                                                className="bg-white/20 text-white border-0 shadow-none p-0 text-sm font-semibold placeholder:text-white/70"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 flex items-center gap-3">
                                <Button
                                    type="submit"
                                    className="px-4 py-2 rounded-full shadow-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition hover:cursor-pointer"
                                >
                                    Guardar Cambios
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="p-2 rounded-full shadow-lg bg-[#b0352c] hover:bg-[#9f2c2c] transition hover:cursor-pointer"
                                            title="Eliminar evento"
                                            type="button"
                                        >
                                            {iconTrash({})}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Eliminar Evento</DialogTitle>
                                            <DialogDescription>
                                                ¿Está seguro que desea eliminar este evento? Esta acción no se puede deshacer.
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
                            <div className="absolute top-4 left-4 flex gap-4">
                                <Link
                                    href="/MisEventos"
                                    className="p-2 rounded-full transition hover:cursor-pointer"
                                    title="Volver a Mis Eventos"
                                >
                                    {iconReturn({})}
                                </Link>
                            </div>
                        </div>
                    </section>
                    <section className="flex-grow px-6 md:px-20 py-12">
                        <div className="max-w-4xl">
                            <div className="flex gap-3 items-center mb-4">
                                {iconPenSquare({})}
                                <h2 className="text-2xl font-bold">Descripción del Evento</h2>
                            </div>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Descripción del evento"
                                value={event.description}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-lg p-4 resize-none min-h-[200px]"
                            />
                        </div>
                    </section>
                </form>
            )}
        </main>
    );
}
