"use client";
import { useUser } from "@/app/contexts/UserContext";
import { SearchIcon, Heart, Share2, EyeOff } from "lucide-react"
import { toast } from "sonner";
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { iconClockwise, iconEye, iconHeart } from "@/app/assets/icons";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getResearch, likeResearch, unlikeResearch } from "@/lib/api/research";

const truncateDescription = (text, limit = 50) => {
    if (!text) return "Sin descripción disponible";
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
};

export default function Investigaciones() {
    const { user } = useUser();
    const [allResearch, setAllResearch] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [likedResearch, setLikedResearch] = useState(new Set());
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        const fetchResearch = async () => {
            setLoading(true);
            const data = await getResearch(100);
            setAllResearch(data);
            setDisplayedResearch(data.slice(0, ITEMS_PER_PAGE));
            setLoading(false);
        };
        fetchResearch();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        setTimeout(() => {
            const newDisplayCount = displayCount + ITEMS_PER_PAGE;
            setDisplayedResearch(allResearch.slice(0, newDisplayCount));
            setDisplayCount(newDisplayCount);
            setLoadingMore(false);
        }, 300);
    };

    const applyFilter = (research, query) => {
        if (!query.trim()) {
            return research;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return research.filter((item) => {
            switch (filterType) {
                case "investigador":
                    return item.author?.toLowerCase().includes(lowerQuery) || 
                           item.user_name?.toLowerCase().includes(lowerQuery) || 
                           false;
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                case "descripcion":
                    return item.description?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(allResearch, searchQuery);
        setDisplayedResearch(filtered.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedResearch(allResearch.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleShareResearch = (researchId) => {
        const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/Investigaciones/${researchId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success("URL copiada al portapapeles");
        }).catch(() => {
            toast.error("Error al copiar la URL");
        });
    };

    const handleLikeResearch = async (researchId) => {
        if (!user) {
            toast.error("Debes iniciar sesión para dar like");
            return;
        }

        try {
            const isLiked = likedResearch.has(researchId);
            let response;

            if (isLiked) {
                response = await unlikeResearch(user.id, researchId);
                if (response?.success) {
                    setLikedResearch((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(researchId);
                        return newSet;
                    });
                    toast.success("Dislike registrado");
                }
            } else {
                response = await likeResearch(user.id, researchId);
                if (response?.success) {
                    setLikedResearch((prev) => new Set(prev).add(researchId));
                    toast.success("Like registrado");
                }
            }
        } catch (error) {
            toast.error("Error al procesar el like");
            console.error(error);
        }
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Investigaciones</h1>
            <p className="mt-3 mb-5">
                Encuentra aquí todas las investigaciones realizadas por cada una de las
                integrantes de la Red de Mujeres Académicas, con su información más relevante.
            </p>
            <div className="flex gap-3 mb-5">
                <Select value={filterType} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Filtrar Por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="investigador">Investigador</SelectItem>
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
                        setDisplayedResearch(allResearch.slice(0, ITEMS_PER_PAGE));
                        setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                    hover:text-[#831d16] hover:cursor-pointer shadow"
                >
                    {iconClockwise({})}
                </Button>
            </div>
            <div className="flex flex-wrap gap-3">
                {loading ? (
                    <>
                        {[...Array(6)].map((_, index) => {
                            return (
                                <div key={index} className="grow min-w-[300px]">
                                    <div className="p-0 overflow-hidden rounded-lg border-none shadow flex flex-col h-full">
                                        {/* Gray Header Skeleton */}
                                        <div className="bg-gray-200 p-6 flex-shrink-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <Skeleton className="h-6 w-3/4 mb-2 bg-gray-300" />
                                                    <Skeleton className="h-4 w-1/2 bg-gray-300" />
                                                </div>
                                                <Skeleton className="h-8 w-8 rounded bg-gray-300" />
                                            </div>
                                        </div>

                                        {/* Content Skeleton */}
                                        <div className="flex-1 p-5 flex flex-col">
                                            <Skeleton className="h-4 w-full mb-2" />
                                            <Skeleton className="h-4 w-5/6 mb-2" />
                                            <Skeleton className="h-4 w-4/5 mb-4" />

                                            {/* Stats Footer Skeleton */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                <div className="flex gap-4">
                                                    <Skeleton className="h-5 w-8" />
                                                    <Skeleton className="h-5 w-8" />
                                                </div>
                                                <Skeleton className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : displayedResearch.length > 0 ? (
                    displayedResearch.map((item) => {
                        const gradients = [
                            "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
                            "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
                            "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
                            "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
                            "bg-gradient-to-r from-[#E7473C] to-[#c2372d]",
                            "bg-gradient-to-r from-[#FF6B55] to-[#831d16]",
                        ];
                        const gradientIndex = (String(item.id || '').charCodeAt(0) || 0) % gradients.length;
                        const gradient = gradients[gradientIndex];

                        return (
                            <Link key={item.id} href={`/Investigaciones/${item.id}`} className="grow">
                                <Card
                                    className="p-0 overflow-hidden rounded-lg border-none shadow
                                    hover:shadow-lg hover:cursor-pointer transition-all duration-300
                                    min-w-[300px] flex flex-col h-full gap-0"
                                >
                                    {/* Gradient Header */}
                                    <div className={`${gradient} p-6 text-white flex-shrink-0`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold line-clamp-2 mb-2">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm opacity-90 line-clamp-1">
                                                    {item.author || item.user_name || "Investigador"}
                                                </p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-white hover:bg-white/20"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 8c1.1 0 2-0.9 2-2s-0.9-2-2-2-2 0.9-2 2 0.9 2 2 2zm0 2c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm0 6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2z" />
                                                        </svg>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {user && (
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleLikeResearch(item.id);
                                                        }}>
                                                            <Heart 
                                                                className={`w-4 h-4 mr-2 ${likedResearch.has(item.id) ? "fill-current text-red-500" : ""}`}
                                                            />
                                                            {likedResearch.has(item.id) ? "Quitar Like" : "Me Gusta"}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShareResearch(item.id);
                                                    }}>
                                                        <Share2 className="w-4 h-4 mr-2" />
                                                        Compartir
                                                    </DropdownMenuItem>
                                                    {user && user.user_type_id === 3 && (
                                                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                            <EyeOff className="w-4 h-4 mr-2" />
                                                            Esconder
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col">
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                                            {truncateDescription(item.description)}
                                        </p>

                                        {/* Stats Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex gap-4 text-sm">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleLikeResearch(item.id);
                                                    }}
                                                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Heart 
                                                        className={`w-4 h-4 ${likedResearch.has(item.id) ? "fill-current text-red-500" : ""}`}
                                                    />
                                                    <span className="text-xs">0</span>
                                                </button>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    {iconEye({ size: 14 })}
                                                    <span className="text-xs">0</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleShareResearch(item.id);
                                                }}
                                                className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
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
                                No hay investigaciones disponibles
                            </h3>
                            <p className="text-gray-500 text-sm">
                                No encontramos investigaciones con los criterios de búsqueda. Intenta con otros términos o filtros.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {displayCount < allResearch.length && !loading && (
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="bg-[#E7473C] hover:bg-[#831d16] rounded text-white
                        hover:text-white hover:cursor-pointer w-full"
                    >
                        {loadingMore ? "Cargando..." : "Cargar más"}
                    </Button>
                </div>
            )}
        </main>
    );
}