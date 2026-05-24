"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { iconEye } from "@/app/assets/icons";
import { Heart, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
    getResearchById,
    getRelatedResearch,
    getResearchPdfUrl,
    registerResearchVisit,
    likeResearch,
    unlikeResearch,
} from "@/lib/api/research";

const PLACEHOLDER_DESCRIPTION = "Exploración detallada de esta investigación académica de la Red de Mujeres Académicas.";

const RECOMMENDED_GRADIENTS = [
    ["#1e3a8a", "#2563eb"],
    ["#1d4ed8", "#3b82f6"],
    ["#2563eb", "#60a5fa"],
    ["#1e3a8a", "#3b82f6"],
    ["#1d4ed8", "#60a5fa"],
    ["#3b82f6", "#1e3a8a"],
];

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function RelatedResearchCard({ research, isLiked, likesCount, onLike }) {
    const [from, to] = RECOMMENDED_GRADIENTS[(String(research.id || "").charCodeAt(0) || 0) % RECOMMENDED_GRADIENTS.length];
    const initials = getInitials(research.author || research.user_name);

    return (
        <Link href={`/Investigaciones/${research.id}`} className="flex flex-col flex-1 group min-w-0">
            <Card className="p-0 overflow-hidden border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col flex-1 gap-0">
                <div
                    className="relative h-28 shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -left-3 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
                    <FileText className="w-10 h-10 text-white/25 group-hover:text-white/35 transition-all duration-300 group-hover:scale-110" strokeWidth={1} />
                    <span className="absolute top-2 left-2 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        IA
                    </span>
                </div>
                <div className="flex flex-col flex-1 p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold shrink-0"
                            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                            {initials}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                            {research.author || research.user_name || "Investigadora"}
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1.5 leading-snug group-hover:text-blue-700 transition-colors duration-200">
                        {research.title || "Sin título"}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 flex-1 leading-relaxed">
                        {research.description || "Sin descripción disponible."}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-blue-50 border border-blue-100">
                        <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-[11px] text-blue-700 font-medium leading-tight">
                            Relacionado con esta investigación
                            {research.similarity_score ? ` en un ${(research.similarity_score * 100).toFixed(0)}%` : ""}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 pt-2.5 mt-2.5 border-t border-slate-100">
                        <button
                            onClick={(e) => { e.preventDefault(); onLike && onLike(research.id); }}
                            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Heart className={`w-3 h-3 ${isLiked ? "fill-current text-red-500" : ""}`} />
                            <span className="text-xs">{likesCount}</span>
                        </button>
                        <div className="flex items-center gap-1 text-slate-400">
                            {iconEye({ size: 12 })}
                            <span className="text-xs">{research.visits_count || 0}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

function RelatedSkeletonCarousel() {
    return (
        <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-0 overflow-hidden border border-blue-100 shadow-sm flex flex-col gap-0 shrink-0 w-64">
                    <Skeleton className="h-28 w-full rounded-none bg-blue-50" />
                    <div className="p-3.5 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-5 h-5 rounded-full bg-blue-50" />
                            <Skeleton className="h-3 w-24 bg-blue-50" />
                        </div>
                        <Skeleton className="h-4 w-full bg-blue-50" />
                        <Skeleton className="h-4 w-4/5 bg-blue-50" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

export default function Investigacion() {
    const params = useParams();
    const { user } = useUser();
    const researchId = params.investigacion;
    
    const [currentResearch, setCurrentResearch] = useState(null);
    const [pdfLinks, setPdfLinks] = useState({ inlineUrl: null, downloadUrl: null });
    const [relatedResearch, setRelatedResearch] = useState([]);
    const [likedResearch, setLikedResearch] = useState(new Set());
    const [likesCounts, setLikesCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const refreshTimeoutRef = useRef(null);
    const pdfContainerRef = useRef(null);
    const refreshBufferMs = 3 * 60 * 1000;
    const fallbackRefreshMs = 25 * 60 * 1000;
    const viewerUrl = pdfLinks.inlineUrl;
    const downloadUrl = pdfLinks.downloadUrl;

    useEffect(() => {
        const fetchResearchData = async () => {
            try {
                setLoading(true);
                setLoadingRelated(true);
                const current = await getResearchById(researchId);

                setCurrentResearch(current);

                if (current?.id) {
                    const related = await getRelatedResearch(current.id, 6, user?.id);
                    setRelatedResearch(related);
                    const counts = {};
                    const liked = new Set();
                    related.forEach((r) => {
                        counts[r.id] = parseInt(r.likes_count) || 0;
                        if (r.is_liked === true || r.is_liked === "true") liked.add(r.id);
                    });
                    setLikesCounts(counts);
                    setLikedResearch(liked);
                }
            } catch (error) {
                console.error("Error fetching research data:", error);
            } finally {
                setLoading(false);
                setLoadingRelated(false);
            }
        };
        
        if (researchId) {
            setPdfLinks({ inlineUrl: null, downloadUrl: null });
            fetchResearchData();
        }

        if (researchId && user?.id) {
            registerResearchVisit(user.id, researchId);
        }
    }, [researchId, user?.id]);

    useEffect(() => {
        let isMounted = true;

        const clearRefreshTimeout = () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }
        };

        const scheduleRefresh = (expiresAt, refreshFn) => {
            clearRefreshTimeout();
            if (!expiresAt) {
                refreshTimeoutRef.current = setTimeout(refreshFn, fallbackRefreshMs);
                return;
            }

            const expiresMs = new Date(expiresAt).getTime();
            if (!Number.isFinite(expiresMs)) {
                refreshTimeoutRef.current = setTimeout(refreshFn, fallbackRefreshMs);
                return;
            }

            const delayMs = Math.max(expiresMs - Date.now() - refreshBufferMs, 1000);
            refreshTimeoutRef.current = setTimeout(refreshFn, delayMs);
        };

        const refreshPdfUrl = async () => {
            if (!researchId || !currentResearch?.research_link) {
                return;
            }

            const result = await getResearchPdfUrl(researchId);
            if (!isMounted) {
                return;
            }

            if (result?.inlineUrl || result?.downloadUrl) {
                setPdfLinks({
                    inlineUrl: result.inlineUrl || null,
                    downloadUrl: result.downloadUrl || result.inlineUrl || null,
                });
            } else {
                setPdfLinks({ inlineUrl: null, downloadUrl: null });
            }

            scheduleRefresh(result?.expiresAt, refreshPdfUrl);
        };

        if (!researchId || !currentResearch?.research_link) {
            clearRefreshTimeout();
            setPdfLinks({ inlineUrl: null, downloadUrl: null });
            return undefined;
        }

        refreshPdfUrl();

        return () => {
            isMounted = false;
            clearRefreshTimeout();
        };
    }, [researchId, currentResearch?.research_link]);


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
            if (!res?.success) throw new Error();
        } catch {
            setLikedResearch((s) => { const n = new Set(s); isLiked ? n.add(researchId) : n.delete(researchId); return n; });
            setLikesCounts((c) => ({ ...c, [researchId]: prev }));
            toast.error("Error al procesar el like");
        }
    };

    const handleFullscreen = () => {
        const container = pdfContainerRef.current;
        if (!container) {
            return;
        }

        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-[600px] w-full rounded-lg" />
                    <Skeleton className="h-8 w-1/2 mt-8" />
                    <Skeleton className="h-6 w-full" />
                </div>
            ) : currentResearch ? (
                <>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold">{currentResearch.title}</h1>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                            {viewerUrl ? (
                                <Button
                                    type="button"
                                    onClick={handleFullscreen}
                                    className="bg-[#fff] hover:bg-[#f0f0f0] text-[#831d16]"
                                >
                                    Ver pantalla completa
                                </Button>
                            ) : null}
                            {downloadUrl ? (
                                <Button asChild className="bg-[#E7473C] hover:bg-[#831d16] text-white">
                                    <a href={downloadUrl} download>
                                        Descargar PDF
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                        </div>
                    <p className="mt-3 text-gray-700">
                        {currentResearch.description || PLACEHOLDER_DESCRIPTION}
                    </p>
                    
                    <section className="mt-4 space-y-4">
                        {viewerUrl ? (
                            <div ref={pdfContainerRef} className="w-full">
                                <iframe
                                    src={viewerUrl}
                                    title={`${currentResearch.title} - PDF de investigación`}
                                    className="w-full h-[90vh] rounded-lg border border-gray-200 bg-white"
                                />
                            </div>
                        ) : currentResearch.research_link ? (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-600 space-y-3">
                                <p className="font-medium text-gray-700">
                                    No se pudo obtener un enlace seguro para este documento.
                                </p>
                                <p className="text-sm">
                                    Reintenta en unos minutos o recarga la pagina.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500">
                                No hay un PDF disponible para esta investigación.
                            </div>
                        )}
                    </section>

                    <section className="mt-10">
                        <div className="flex items-start gap-2.5 mb-5">
                            <div className="p-1.5 bg-blue-100 rounded-lg shrink-0 mt-0.5">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-800">Recomendadas por IA</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Investigaciones similares seleccionadas según el contenido de este documento.
                                </p>
                            </div>
                        </div>

                        {loadingRelated ? (
                            <RelatedSkeletonCarousel />
                        ) : relatedResearch.length > 0 ? (
                            <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                                <CarouselContent className="-ml-3">
                                    {relatedResearch.map((research) => (
                                        <CarouselItem key={research.id} className="pl-3 basis-70 sm:basis-75 flex flex-col">
                                            <RelatedResearchCard
                                                research={research}
                                                isLiked={likedResearch.has(research.id)}
                                                likesCount={likesCounts[research.id] ?? 0}
                                                onLike={handleLike}
                                            />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="hover:cursor-pointer -left-4 border-blue-200 bg-white text-blue-600 shadow-sm hover:bg-blue-50 h-7 w-7" />
                                <CarouselNext className="hover:cursor-pointer -right-4 border-blue-200 bg-white text-blue-600 shadow-sm hover:bg-blue-50 h-7 w-7" />
                            </Carousel>
                        ) : (
                            <div className="flex items-center gap-4 py-6">
                                <div className="p-3 bg-blue-100 rounded-full shrink-0">
                                    <Sparkles className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Sin recomendaciones aún</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        No encontramos investigaciones similares en este momento.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </>
            ) : (
                <div className="text-center py-10">
                    <p>Investigación no encontrada</p>
                </div>
            )}
        </main>
    );
}