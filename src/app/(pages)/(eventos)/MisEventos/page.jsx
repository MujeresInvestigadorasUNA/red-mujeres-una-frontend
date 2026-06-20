"use client";
import { useUser } from "@/app/contexts/UserContext";
import { Share2, Search, RefreshCw, CalendarDays, Plus, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo } from "react";
import { createEvent, getEventsByUserId } from "@/lib/api/events";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const ACCENT_COLORS = [
    { bg: "bg-[#831d16]", text: "text-[#831d16]" },
    { bg: "bg-[#c2372d]", text: "text-[#c2372d]" },
    { bg: "bg-[#E7473C]", text: "text-[#E7473C]" },
    { bg: "bg-[#b91c1c]", text: "text-[#b91c1c]" },
];

const MONTHS_SHORT = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function parseDateLocal(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
}

export default function MisEventos() {
    const { user } = useUser();
    const [allEvents, setAllEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [creating, setCreating] = useState(false);
    const ITEMS_PER_PAGE = 10;

    const userId = useMemo(() => user?.id ?? user?.user_id ?? null, [user]);

    const fetchEvents = async () => {
        if (!userId) {
            setLoadingEvents(false);
            return;
        }
        try {
            const response = await getEventsByUserId(userId);
            if (response.ok) {
                const data = await response.json();
                setAllEvents(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error al cargar los eventos:", error);
            toast.error("Error al cargar los eventos.");
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        setLoadingEvents(true);
        fetchEvents();
    }, [userId]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleClear = () => {
        setSearchQuery("");
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleShareEvent = (eventId) => {
        const shareUrl = `${window.location.origin}/Eventos/${eventId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success("URL copiada al portapapeles");
        }).catch(() => {
            toast.error("Error al copiar la URL");
        });
    };

    const handleCreateEvent = async () => {
        if (!userId) return;
        try {
            setCreating(true);
            const response = await createEvent(userId);
            if (response.ok) {
                const data = await response.json();
                toast.success("Evento creado correctamente.");
                if (data?.id) {
                    window.location.href = `/MisEventos/${data.id}`;
                } else {
                    fetchEvents();
                }
            } else {
                toast.error("Error al crear el evento.");
            }
        } catch (error) {
            toast.error("Error al crear el evento.");
        } finally {
            setCreating(false);
        }
    };

    const q = searchQuery.toLowerCase().trim();
    const filtered = allEvents.filter(
        (event) =>
            !q ||
            event.title?.toLowerCase().includes(q) ||
            event.description?.toLowerCase().includes(q)
    );
    const displayed = filtered.slice(0, displayCount);

    return (
        <main className="min-h-screen bg-slate-50">
            <section
                className="px-6 md:px-16 xl:px-20 py-8"
                style={{ background: "linear-gradient(135deg, #831d16, #E7473C)" }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wide">
                        Panel Personal
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Mis Eventos</h1>
                        <p className="text-white/70 text-sm mt-1 max-w-xl leading-relaxed">
                            Crea y gestiona tus eventos para compartir con la comunidad de la Red de Mujeres Académicas UNA.
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateEvent}
                        disabled={creating}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {creating ? "Creando..." : "Nuevo Evento"}
                    </Button>
                </div>
            </section>

            <section className="px-6 md:px-16 xl:px-20 py-8 max-w-5xl mx-auto">
                <div className="flex gap-2 mb-5 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar eventos..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-9 h-9 text-sm bg-white border-slate-200"
                        />
                    </div>
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="h-9 w-9 text-slate-400 hover:text-slate-600"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>

                {!loadingEvents && (
                    <p className="text-xs text-slate-400 mb-5">
                        {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
                        {searchQuery && ` para "${searchQuery}"`}
                    </p>
                )}

                <div className="flex flex-col gap-4 pb-10">
                    {loadingEvents ? (
                        [...Array(4)].map((_, i) => (
                            <Card key={i} className="p-0 overflow-hidden border border-slate-100 shadow-sm flex flex-row gap-0">
                                <Skeleton className="w-24 md:w-28 shrink-0 rounded-none" />
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </Card>
                        ))
                    ) : displayed.length > 0 ? (
                        displayed.map((event) => {
                            const accent = ACCENT_COLORS[(String(event.id || "").charCodeAt(0) || 0) % ACCENT_COLORS.length];
                            const date = parseDateLocal(event.initial_date);
                            const endDate = parseDateLocal(event.final_date);
                            const day = date ? date.getDate() : null;
                            const month = date ? MONTHS_SHORT[date.getMonth()] : null;
                            const year = date ? date.getFullYear() : null;

                            return (
                                <Link key={event.id} href={`/MisEventos/${event.id}`} className="block group">
                                    <Card className="p-0 overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#E7473C]/40 transition-all duration-300 flex flex-row h-full gap-0">

                                        <div className={`${accent.bg} w-24 md:w-28 shrink-0 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
                                            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10" />
                                            <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
                                            {day ? (
                                                <div className="relative z-10 flex flex-col items-center py-4">
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                                                        {month}
                                                    </span>
                                                    <span className="text-4xl md:text-5xl font-extrabold leading-none mt-0.5">
                                                        {day}
                                                    </span>
                                                    <span className="text-[10px] text-white/60 mt-1">{year}</span>
                                                </div>
                                            ) : (
                                                <CalendarDays className="w-10 h-10 text-white/40" strokeWidth={1} />
                                            )}
                                        </div>

                                        <div className="flex flex-col flex-1 p-4 md:p-5 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-[#831d16] transition-colors duration-200">
                                                    {event.title || "Sin título"}
                                                </h3>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleShareEvent(event.id); }}
                                                    className="text-slate-300 hover:text-[#E7473C] transition-colors shrink-0 mt-0.5"
                                                    title="Compartir"
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                                {event.description || "Sin descripción disponible."}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-auto">
                                                {event.modality && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                                        <MapPin className="w-3 h-3" />
                                                        {event.modality}
                                                    </span>
                                                )}
                                                {date && endDate && event.initial_date !== event.final_date && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {date.toLocaleDateString("es-CR", { day: "2-digit", month: "short" })}
                                                        {" – "}
                                                        {endDate.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </span>
                                                )}
                                                <span className={`ml-auto inline-flex items-center gap-1 text-[11px] font-medium ${accent.text} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                                                    Editar
                                                    <ArrowRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>

                                    </Card>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center py-24">
                            <div className="text-center max-w-sm">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-slate-100 rounded-full">
                                        <CalendarDays className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-slate-700 mb-1">
                                    No hay eventos
                                </h3>
                                <p className="text-slate-500 text-sm">
                                    Crea tu primer evento para compartir con la comunidad.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {displayCount < filtered.length && !loadingEvents && (
                    <div className="flex justify-center mt-2 pb-8">
                        <Button
                            onClick={() => setDisplayCount((c) => c + ITEMS_PER_PAGE)}
                            variant="outline"
                            className="border-slate-200 text-slate-600 hover:border-[#E7473C] hover:text-[#E7473C] transition-colors w-full"
                        >
                            Cargar más · {filtered.length - displayCount} restantes
                        </Button>
                    </div>
                )}
            </section>
        </main>
    );
}
