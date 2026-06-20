"use client";
import { iconCalendar, iconPenSquare } from "@/app/assets/icons";
import { getEventById, getEvents } from "@/lib/api/events";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const gradients = [
    "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
    "bg-gradient-to-br from-[#c2372d] to-[#E7473C]",
    "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
    "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
    "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
    "bg-gradient-to-br from-[#E7473C] to-[#c2372d]",
];

export default function Evento({ params }) {
    const { evento: eventId } = use(params);
    const [event, setEvent] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoadingEvent(true);
                const response = await getEventById(eventId);
                if (response.ok) {
                    const data = await response.json();
                    setEvent(data);
                } else {
                    toast.error("Error al cargar la información del evento.");
                }
            } catch (error) {
                toast.error("Error al cargar la información del evento.");
            } finally {
                setLoadingEvent(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId]);

    const gradient = gradients[(String(eventId || "").charCodeAt(0) || 0) % gradients.length];
    const taughtBy = event?.user
        ? `${event.user.first_name} ${event.user.last_name}`
        : "Organizadora";

    return (
        <main className="flex-grow h-[100%]">
            {loadingEvent ? (
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
                    </section>
                </div>
            ) : event ? (
                <div className="flex flex-col">
                    <section className="relative w-full">
                        <div className={`${gradient} p-8 md:p-12 text-white`}>
                            <div className="max-w-4xl">
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 line-clamp-3">
                                    {event.title || "Sin título"}
                                </h1>
                                <p className="text-lg opacity-90 mb-6">
                                    Organizado por: <span className="font-semibold">{taughtBy}</span>
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    {event.initial_date && (
                                        <div className="flex items-center gap-2">
                                            {iconCalendar({ size: 16 })}
                                            <div>
                                                <p className="opacity-75 text-xs">Inicio</p>
                                                <p className="font-semibold">{event.initial_date}</p>
                                            </div>
                                        </div>
                                    )}
                                    {event.final_date && (
                                        <div className="flex items-center gap-2">
                                            {iconCalendar({ size: 16 })}
                                            <div>
                                                <p className="opacity-75 text-xs">Finalización</p>
                                                <p className="font-semibold">{event.final_date}</p>
                                            </div>
                                        </div>
                                    )}
                                    {event.max_registration_date && (
                                        <div className="flex items-center gap-2">
                                            {iconCalendar({ size: 16 })}
                                            <div>
                                                <p className="opacity-75 text-xs">Registro Máximo</p>
                                                <p className="font-semibold">{event.max_registration_date}</p>
                                            </div>
                                        </div>
                                    )}
                                    {event.modality && (
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4" />
                                            <div>
                                                <p className="opacity-75 text-xs">Modalidad</p>
                                                <p className="font-semibold">{event.modality}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="flex-grow px-6 md:px-20 py-12">
                        <div className="max-w-4xl mb-12">
                            <div className="flex gap-3 items-center mb-4">
                                {iconPenSquare({})}
                                <h2 className="text-2xl font-bold">Descripción del Evento</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-justify">
                                {event.description || "Sin descripción disponible."}
                            </p>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500">Evento no encontrado</p>
                </div>
            )}
        </main>
    );
}
