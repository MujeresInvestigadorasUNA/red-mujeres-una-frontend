"use client";
import { capitalizeWords } from "@/app/assets/utils";
import { getProfilePictureUrl } from "@/lib/api/auth";
import { getUser } from "@/lib/api/forums";
import { getResearchByUserId, getResearchPdfUrl, likeResearch, unlikeResearch, getAuthorsData, getAuthorDisplay } from "@/lib/api/research";
import AuthorLinks from "@/app/components/AuthorLinks";
import { getEventsByUserId } from "@/lib/api/events";
import { useUser } from "@/app/contexts/UserContext";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Search, RefreshCw, FileText, CalendarDays,
    Heart, Eye, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const RESEARCH_GRADIENTS = [
    ["#831d16", "#c2372d"],
    ["#c2372d", "#E7473C"],
    ["#E7473C", "#FF6B55"],
    ["#831d16", "#E7473C"],
];

const EVENT_COLORS = [
    "bg-[#831d16]",
    "bg-[#c2372d]",
    "bg-[#E7473C]",
    "bg-[#b91c1c]",
];

const MONTHS_SHORT = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function parseDateLocal(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function hashIndex(id, len) {
    return (String(id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % len;
}

export default function ForoPage({ params }) {
    const { user, userLoading } = useUser();
    const { foro: foroId } = use(params);

    const [forum, setForum] = useState(null);
    const [photoSignedUrl, setPhotoSignedUrl] = useState(null);
    const [research, setResearch] = useState([]);
    const [events, setEvents] = useState([]);
    const [loadingForum, setLoadingForum] = useState(true);
    const [loadingResearch, setLoadingResearch] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [activeTab, setActiveTab] = useState("investigaciones");
    const [searchQuery, setSearchQuery] = useState("");
    const [likedResearch, setLikedResearch] = useState(new Set());
    const [likesCounts, setLikesCounts] = useState({});

    // ── Data fetching ────────────────────────────────────────────
    useEffect(() => {
        if (!foroId || userLoading) return;

        const fetchAll = async () => {
            // Profile
            try {
                setLoadingForum(true);
                const userData = await getUser({ user_id: foroId });
                if (userData) {
                    setForum(userData);
                    if (userData.photo) {
                        getProfilePictureUrl({ user_id: foroId })
                            .then((r) => r.ok ? r.json() : null)
                            .then((d) => setPhotoSignedUrl(d?.url || d?.signed_url || d || null))
                            .catch(() => {});
                    }
                }
            } catch (e) {
                console.error(e);
                toast.error("Error al cargar el perfil");
            } finally {
                setLoadingForum(false);
            }

            // Research
            try {
                setLoadingResearch(true);
                const data = await getResearchByUserId(foroId, user?.id || null);
                const arr = Array.isArray(data) ? data : [];
                const counts = {};
                const liked = new Set();
                arr.forEach((r) => {
                    counts[r.id] = parseInt(r.likes_count) || 0;
                    if (r.is_liked === true || r.is_liked === "true") liked.add(r.id);
                });
                setLikesCounts(counts);
                setLikedResearch(liked);
                setResearch(arr);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingResearch(false);
            }

            // Events
            try {
                setLoadingEvents(true);
                const res = await getEventsByUserId(foroId);
                if (res.ok) {
                    const data = await res.json();
                    setEvents(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchAll();
    }, [foroId, userLoading]);

    // ── Like toggle ──────────────────────────────────────────────
    const handleLike = async (researchId) => {
        if (!user) { toast.error("Debes iniciar sesión para dar like"); return; }
        const isLiked = likedResearch.has(researchId);
        const prev = likesCounts[researchId] || 0;

        setLikedResearch((s) => { const n = new Set(s); isLiked ? n.delete(researchId) : n.add(researchId); return n; });
        setLikesCounts((c) => ({ ...c, [researchId]: isLiked ? prev - 1 : prev + 1 }));

        try {
            const res = isLiked
                ? await unlikeResearch(user.id, researchId)
                : await likeResearch(user.id, researchId);
            if (!res) throw new Error();
        } catch {
            setLikedResearch((s) => { const n = new Set(s); isLiked ? n.add(researchId) : n.delete(researchId); return n; });
            setLikesCounts((c) => ({ ...c, [researchId]: prev }));
            toast.error("Error al procesar el like");
        }
    };

    // ── Open PDF ─────────────────────────────────────────────────
    const handleOpenResearch = async (researchId) => {
        try {
            const result = await getResearchPdfUrl(researchId);
            if (!result?.inlineUrl) { toast.error("No se pudo obtener el documento."); return; }
            window.open(result.inlineUrl, "_blank", "noopener,noreferrer");
        } catch {
            toast.error("No se pudo abrir el documento.");
        }
    };

    // ── Filtered lists ───────────────────────────────────────────
    const q = searchQuery.toLowerCase();
    const filteredResearch = research.filter((r) =>
        !q || r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
    );
    const filteredEvents = events.filter((c) =>
        !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery("");
    };

    const fullName = forum
        ? capitalizeWords(`${forum.first_name} ${forum.last_name}`)
        : "";

    // ── Render ───────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-slate-50">

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-[#831d16] to-[#E7473C] px-6 md:px-16 xl:px-20 py-10">
                {loadingForum ? (
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                        <Skeleton className="w-28 h-28 rounded-full shrink-0 bg-white/20" />
                        <div className="flex flex-col gap-3 w-full">
                            <Skeleton className="h-8 w-56 bg-white/20" />
                            <Skeleton className="h-5 w-36 bg-white/20" />
                            <Skeleton className="h-4 w-full bg-white/20" />
                            <Skeleton className="h-4 w-4/5 bg-white/20" />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-28 h-28 rounded-full border-4 border-white/30 overflow-hidden shrink-0 bg-white/20 flex items-center justify-center shadow-lg">
                            {photoSignedUrl ? (
                                <img src={photoSignedUrl} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-3xl">
                                    {getInitials(fullName)}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                            {forum?.user_profession && (
                                <p className="text-white/75 text-sm font-medium">{forum.user_profession}</p>
                            )}
                            {forum?.user_description && (
                                <p className="text-white/65 text-sm mt-2 max-w-2xl leading-relaxed">
                                    {forum.user_description}
                                </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                                <span className="flex items-center gap-1.5 text-white/70 text-xs">
                                    <FileText className="w-3.5 h-3.5" />
                                    {research.length} investigación{research.length !== 1 ? "es" : ""}
                                </span>
                                <span className="flex items-center gap-1.5 text-white/70 text-xs">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    {events.length} evento{events.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Tabs + Content ────────────────────────────────── */}
            <section className="px-6 md:px-16 xl:px-20 py-8 max-w-7xl mx-auto">

                {/* Tab bar + search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit shadow-sm">
                        <button
                            onClick={() => handleTabChange("investigaciones")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                activeTab === "investigaciones"
                                    ? "bg-[#E7473C] text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            Investigaciones
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === "investigaciones" ? "bg-white/20" : "bg-slate-100"
                            }`}>
                                {research.length}
                            </span>
                        </button>
                        <button
                            onClick={() => handleTabChange("eventos")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                activeTab === "eventos"
                                    ? "bg-[#E7473C] text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            Eventos
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === "eventos" ? "bg-white/20" : "bg-slate-100"
                            }`}>
                                {events.length}
                            </span>
                        </button>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto sm:max-w-xs">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                                placeholder="Buscar por título..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9 text-sm bg-white border-slate-200"
                            />
                        </div>
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="h-9 px-2 text-slate-400 hover:text-slate-600"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Investigaciones tab ──────────────────────── */}
                {activeTab === "investigaciones" && (
                    <div>
                        {loadingResearch ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="p-0 overflow-hidden border border-slate-100 flex flex-col gap-0">
                                        <Skeleton className="h-28 w-full rounded-none" />
                                        <div className="p-3.5 flex flex-col gap-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-4/5" />
                                            <Skeleton className="h-3 w-3/4 mt-1" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredResearch.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredResearch.map((item) => {
                                    const [from, to] = RESEARCH_GRADIENTS[hashIndex(item.id, RESEARCH_GRADIENTS.length)];
                                    const isLiked = likedResearch.has(item.id);
                                    return (
                                        <Link key={item.id} href={`/Investigaciones/${item.id}`} className="block group">
                                            <Card className="p-0 overflow-hidden border border-slate-100 hover:border-[#E7473C]/30 hover:shadow-md transition-all duration-300 flex flex-col gap-0 h-full">
                                                {/* Gradient header */}
                                                <div
                                                    className="relative h-24 shrink-0 flex items-center justify-center overflow-hidden"
                                                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                                                >
                                                    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                                                    <div className="absolute -left-2 -bottom-3 w-14 h-14 rounded-full bg-white/10" />
                                                    <FileText className="w-9 h-9 text-white/25 group-hover:text-white/40 transition-all duration-300" strokeWidth={1} />
                                                </div>

                                                {/* Body */}
                                                <div className="flex flex-col flex-1 p-3.5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AuthorLinks authors={getAuthorsData(item)} fallback={getAuthorDisplay(item)} />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1.5 leading-snug group-hover:text-[#831d16] transition-colors duration-200">
                                                        {item.title}
                                                    </h3>
                                                    {item.description && (
                                                        <p className="text-xs text-slate-500 line-clamp-2 flex-1 leading-relaxed mb-2">
                                                            {item.description}
                                                        </p>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); handleLike(item.id); }}
                                                                className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current text-red-500" : ""}`} />
                                                                <span className="text-xs">{likesCounts[item.id] ?? 0}</span>
                                                            </button>
                                                            <div className="flex items-center gap-1 text-slate-400">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span className="text-xs">{item.visits_count || 0}</span>
                                                            </div>
                                                        </div>
                                                        {item.research_link && (
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); handleOpenResearch(item.id); }}
                                                                className="text-xs text-[#E7473C] hover:text-[#831d16] font-medium transition-colors"
                                                            >
                                                                Ver PDF →
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<FileText className="w-10 h-10 text-slate-300" strokeWidth={1.5} />}
                                title={searchQuery ? "Sin resultados" : "Sin investigaciones"}
                                description={
                                    searchQuery
                                        ? `No se encontraron investigaciones para "${searchQuery}"`
                                        : "Esta investigadora aún no ha publicado investigaciones."
                                }
                            />
                        )}
                    </div>
                )}

                {/* ── Eventos tab ──────────────────────────────── */}
                {activeTab === "eventos" && (
                    <div>
                        {loadingEvents ? (
                            <div className="flex flex-col gap-3">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i} className="p-0 overflow-hidden border border-slate-100 flex flex-row gap-0">
                                        <Skeleton className="w-20 shrink-0 rounded-none" />
                                        <div className="p-3.5 flex flex-col gap-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredEvents.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {filteredEvents.map((evt) => {
                                    const colorClass = EVENT_COLORS[hashIndex(evt.id, EVENT_COLORS.length)];
                                    const date = parseDateLocal(evt.initial_date);
                                    const day = date ? date.getDate() : null;
                                    const month = date ? MONTHS_SHORT[date.getMonth()] : null;

                                    return (
                                        <Link key={evt.id} href={`/Eventos/${evt.id}`} className="group">
                                            <Card className="p-0 overflow-hidden border border-slate-200 hover:border-[#E7473C]/40 hover:shadow-md transition-all duration-300 flex flex-row gap-0 h-full">
                                                <div className={`${colorClass} w-20 shrink-0 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
                                                    <div className="absolute -right-4 -top-4 w-14 h-14 rounded-full bg-white/10" />
                                                    {day ? (
                                                        <div className="relative z-10 flex flex-col items-center py-3">
                                                            <span className="text-[9px] font-semibold uppercase tracking-widest text-white/70">{month}</span>
                                                            <span className="text-3xl font-extrabold leading-none mt-0.5">{day}</span>
                                                        </div>
                                                    ) : (
                                                        <CalendarDays className="w-7 h-7 text-white/40" strokeWidth={1} />
                                                    )}
                                                </div>

                                                <div className="flex flex-col flex-1 p-3.5 min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-[#831d16] transition-colors duration-200">
                                                        {evt.title || "Sin título"}
                                                    </h3>
                                                    {evt.description && (
                                                        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed mt-0.5">
                                                            {evt.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                        {evt.modality && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                                                                <Layers className="w-3 h-3" />
                                                                {evt.modality}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<CalendarDays className="w-10 h-10 text-slate-300" strokeWidth={1.5} />}
                                title={searchQuery ? "Sin resultados" : "Sin eventos"}
                                description={
                                    searchQuery
                                        ? `No se encontraron eventos para "${searchQuery}"`
                                        : "Esta investigadora aún no ha creado eventos."
                                }
                            />
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

function EmptyState({ icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-slate-100 rounded-full mb-4">{icon}</div>
            <h3 className="text-sm font-semibold text-slate-600 mb-1">{title}</h3>
            <p className="text-xs text-slate-400 max-w-xs">{description}</p>
        </div>
    );
}
