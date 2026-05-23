"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { iconClockwise, iconEye, iconHeart } from "@/app/assets/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getResearch,
    getResearchById,
    getRelatedResearch,
    getResearchPdfUrl,
    registerResearchVisit,
} from "@/lib/api/research";

const GRADIENTS = [
    "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
    "bg-gradient-to-br from-[#c2372d] to-[#E7473C]",
    "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
    "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
    "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
    "bg-gradient-to-br from-[#E7473C] to-[#831d16]",
];

const truncateDescription = (text, limit = 100) => {
    return text?.length > limit ? text.substring(0, limit) + "..." : text || "Sin descripción disponible";
};

const PLACEHOLDER_DESCRIPTION = "Exploración detallada de esta investigación académica de la Red de Mujeres Académicas.";

const isValidImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const urlLower = url.toLowerCase();
    return imageExtensions.some((ext) => urlLower.includes(ext));
};

export default function Investigacion() {
    const params = useParams();
    const { user } = useUser();
    const researchId = params.investigacion;
    
    const [currentResearch, setCurrentResearch] = useState(null);
    const [pdfLinks, setPdfLinks] = useState({ inlineUrl: null, downloadUrl: null });
    const [relatedResearch, setRelatedResearch] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
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

                // Fetch related research based on vector similarity
                if (current?.id) {
                    const related = await getRelatedResearch(current.id, 4);
                    setRelatedResearch(related);
                    setDisplayedResearch(related);
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


    const applyFilter = (research, query) => {
        if (!query.trim()) {
            return research;
        }

        const lowerQuery = query.toLowerCase();

        return research.filter((item) => {
            switch (filterType) {
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                case "descripcion":
                    return item.description?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return (
                        item.title?.toLowerCase().includes(lowerQuery) ||
                        item.description?.toLowerCase().includes(lowerQuery) ||
                        false
                    );
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(relatedResearch, searchQuery);
        setDisplayedResearch(filtered);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedResearch(relatedResearch);
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

                    <section>
                        <h2 className="text-2xl font-bold mt-10 mb-5">Investigaciones Relacionadas</h2>
                        <div className="flex gap-3 mb-5 mt-5">
                            <Select value={filterType} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                                    <SelectValue placeholder="Filtrar Por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="titulo">Titulo</SelectItem>
                                        <SelectItem value="descripcion">Descripción</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <ButtonGroup className="rounded bg-[#fff] w-full">
                                <Input
                                    className="rounded"
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <Button
                                    onClick={handleSearch}
                                    className="bg-[#E7473C] hover:bg-[#831d16] rounded text-white
                                    hover:text-white hover:cursor-pointer"
                                    variant="outline"
                                    aria-label="Search"
                                >
                                    <SearchIcon />
                                </Button>
                            </ButtonGroup>
                            <Button
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterType("");
                                    setDisplayedResearch(relatedResearch);
                                }}
                                className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                                hover:text-[#831d16] hover:cursor-pointer shadow"
                            >
                                {iconClockwise({})}
                            </Button>
                        </div>
                        <div className="flex flex-col gap-5 mt-5">
                            {loadingRelated ? (
                                <>
                                    {[...Array(6)].map((_, index) => (
                                        <div key={index} className="w-full">
                                            <Card className="overflow-hidden border-none shadow h-full flex flex-col p-0">
                                                <div className="bg-gray-200 p-6 text-white flex-shrink-0">
                                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                                <div className="flex-1 px-6 py-3 flex flex-col gap-3">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-3/4" />
                                                </div>
                                                <div className="px-6 py-4 flex items-center justify-between border-t bg-gray-50">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </>
                            ) : displayedResearch.length > 0 ? (
                                displayedResearch.map((research) => {
                                    const gradient = GRADIENTS[(String(research.id || '').charCodeAt(0) || 0) % GRADIENTS.length];
                                    return (
                                        <Link key={research.id} href={`/Investigaciones/${research.id}`} className="w-full">
                                            <Card className="overflow-hidden border-none shadow h-full flex flex-col hover:shadow-lg transition p-0">
                                                {/* Gradient Header */}
                                                <div className={`${gradient} p-6 text-white flex-shrink-0`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold line-clamp-2 mb-2">
                                                                {research.title || "Sin título"}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="flex-1 px-6 py-3 flex flex-col gap-3">
                                                    <p className="text-gray-700 text-sm line-clamp-3">
                                                        {truncateDescription(research.description || "Investigación recomendada por similitud de contenido", 100)}
                                                    </p>
                                                    {research.similarity_score && (
                                                        <p className="text-xs text-gray-500">
                                                            Similitud: {(research.similarity_score * 100).toFixed(1)}%
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Stats Footer */}
                                                <div className="px-6 py-4 flex items-center justify-between border-t bg-gray-50">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {iconHeart({ size: 16 })}
                                                        <span>{research.likes_count || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {iconEye({ size: 16 })}
                                                        <span>{research.views_count || 0}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="w-full flex items-center justify-center py-20">
                                    <div className="text-center max-w-md">
                                        <div className="flex justify-center mb-4">
                                            <div className="p-4 bg-gray-100 rounded-full">
                                                <svg
                                                    className="w-12 h-12 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                            No hay investigaciones relacionadas
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            No encontramos otras investigaciones relacionadas en este momento.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
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