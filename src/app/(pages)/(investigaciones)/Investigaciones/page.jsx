"use client";
import { useUser } from "@/app/contexts/UserContext";
import { Heart, Share2, EyeOff, FileText, MoreVertical, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { iconEye } from "@/app/assets/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getResearch, likeResearch, unlikeResearch } from "@/lib/api/research";

const COVER_GRADIENTS = [
    ["#831d16", "#c2372d"],
    ["#c2372d", "#E7473C"],
    ["#E7473C", "#FF6B55"],
    ["#831d16", "#E7473C"],
    ["#c2372d", "#FF6B55"],
    ["#E7473C", "#831d16"],
];

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function ResearchCardSkeleton() {
    return (
        <Card className="p-0 overflow-hidden border border-slate-100 shadow-sm flex flex-col gap-0">
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                    <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-full mt-1" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
                    <div className="flex gap-3">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-3 w-4" />
                </div>
            </div>
        </Card>
    );
}

export default function Investigaciones() {
    const { user } = useUser();
    const [allResearch, setAllResearch] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [likedResearch, setLikedResearch] = useState(new Set());
    const [likesCounts, setLikesCounts] = useState({});
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        const fetchResearch = async () => {
            setLoading(true);
            const data = await getResearch(100, user?.id);
            setAllResearch(data);

            const initialLiked = new Set();
            const initialCounts = {};
            data.forEach((research) => {
                const isLiked = research.is_liked === true || research.is_liked === "true";
                if (isLiked) initialLiked.add(research.id);
                initialCounts[research.id] = parseInt(research.likes_count) || 0;
            });

            setLikedResearch(initialLiked);
            setLikesCounts(initialCounts);
            setDisplayedResearch(data.slice(0, ITEMS_PER_PAGE));
            setLoading(false);
        };
        fetchResearch();
    }, [user?.id]);

    const handleLoadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            const next = displayCount + ITEMS_PER_PAGE;
            setDisplayedResearch(allResearch.slice(0, next));
            setDisplayCount(next);
            setLoadingMore(false);
        }, 300);
    };

    const applyFilter = (research, query) => {
        if (!query.trim()) return research;
        const q = query.toLowerCase();
        return research.filter((item) =>
            item.author?.toLowerCase().includes(q) ||
            item.user_name?.toLowerCase().includes(q) ||
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        );
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleClear = () => {
        setSearchQuery("");
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleShare = (researchId) => {
        const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/Investigaciones/${researchId}`;
        navigator.clipboard.writeText(url).then(
            () => toast.success("URL copiada al portapapeles"),
            () => toast.error("Error al copiar la URL"),
        );
    };

    const q = searchQuery.toLowerCase().trim();
    const filtered = allResearch.filter(
        (item) =>
            !q ||
            item.author?.toLowerCase().includes(q) ||
            item.user_name?.toLowerCase().includes(q) ||
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
    );
    const displayed = filtered.slice(0, displayCount);
    const hasMore = filtered.length > displayCount;

    const handleLike = async (researchId) => {
        if (!user) { toast.error("Debes iniciar sesión para dar like"); return; }
        const isLiked = likedResearch.has(researchId);
        const prev = likesCounts[researchId] || 0;

        setLikedResearch((s) => {
            const n = new Set(s);
            isLiked ? n.delete(researchId) : n.add(researchId);
            return n;
        });
        setLikesCounts((c) => ({ ...c, [researchId]: isLiked ? prev - 1 : prev + 1 }));

        try {
            const res = isLiked
                ? await unlikeResearch(user.id, researchId)
                : await likeResearch(user.id, researchId);
            if (!res?.success) throw new Error();
        } catch {
            setLikedResearch((s) => {
                const n = new Set(s);
                isLiked ? n.add(researchId) : n.delete(researchId);
                return n;
            });
            setLikesCounts((c) => ({ ...c, [researchId]: prev }));
            toast.error("Error al procesar el like");
        }
    };

    return (
        <main className="grow">
            {/* Header */}
            <section
                className="px-6 md:px-16 xl:px-20 py-8"
                style={{ background: "linear-gradient(135deg, #831d16, #E7473C)" }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wide">
                        Investigación
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">Investigaciones</h1>
                <p className="text-white/70 text-sm mt-1 max-w-xl leading-relaxed">
                    Encuentra aquí todas las investigaciones realizadas por las integrantes de la Red de Mujeres Académicas.
                </p>
            </section>

            {/* Search & Filter bar */}
            <div className="px-6 md:px-16 xl:px-20 pt-8">
                <div className="flex gap-2 mb-5 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar investigaciones..."
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

                {!loading && (
                    <p className="text-xs text-slate-400 mb-5">
                        {filtered.length} investigación{filtered.length !== 1 ? "es" : ""}
                        {searchQuery && ` para "${searchQuery}"`}
                    </p>
                )}
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-6 md:px-16 xl:px-20 pb-10">
                {loading ? (
                    [...Array(9)].map((_, i) => <ResearchCardSkeleton key={i} />)
                ) : displayed.length > 0 ? (
                    displayed.map((item) => {
                        const [from, to] = COVER_GRADIENTS[(String(item.id || "").charCodeAt(0) || 0) % COVER_GRADIENTS.length];
                        const authorName = item.author || item.user_name || "Investigadora";
                        const initials = getInitials(authorName);
                        const isLiked = likedResearch.has(item.id);

                        return (
                            <Link key={item.id} href={`/Investigaciones/${item.id}`} className="block group">
                                <Card className="p-0 overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:border-[#E7473C]/30 transition-all duration-300 flex flex-col h-full gap-0">

                                    {/* Cover */}
                                    <div
                                        className="relative h-36 shrink-0 flex items-center justify-center overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                                    >
                                        {/* Decorative circles */}
                                        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
                                        <div className="absolute -left-4 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
                                        <div className="absolute right-8 bottom-4 w-10 h-10 rounded-full bg-white/8" />

                                        {/* Doc icon */}
                                        <FileText
                                            className="w-14 h-14 text-white/25 group-hover:text-white/35 transition-all duration-300 group-hover:scale-110"
                                            strokeWidth={1}
                                        />

                                        {/* Actions */}
                                        <div className="absolute top-2.5 right-2.5" onClick={(e) => e.preventDefault()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-white/75 hover:bg-white/20 hover:text-white"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {user && (
                                                        <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleLike(item.id); }}>
                                                            <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current text-red-500" : ""}`} />
                                                            {isLiked ? "Quitar like" : "Me gusta"}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleShare(item.id); }}>
                                                        <Share2 className="w-4 h-4 mr-2" />
                                                        Compartir
                                                    </DropdownMenuItem>
                                                    {user?.user_type_id === 3 && (
                                                        <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                                                            <EyeOff className="w-4 h-4 mr-2" />
                                                            Esconder
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-4">
                                        {/* Author */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                                            >
                                                {initials}
                                            </span>
                                            <span className="text-xs text-slate-500 truncate">{authorName}</span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 leading-snug group-hover:text-[#831d16] transition-colors duration-200">
                                            {item.title || "Sin título"}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-slate-500 line-clamp-3 flex-1 leading-relaxed">
                                            {item.description || "Sin descripción disponible."}
                                        </p>

                                        {/* Stats footer */}
                                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleLike(item.id); }}
                                                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current text-red-500" : ""}`} />
                                                    <span className="text-xs">{likesCounts[item.id] || 0}</span>
                                                </button>
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    {iconEye({ size: 14 })}
                                                    <span className="text-xs">{item.visits_count || 0}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleShare(item.id); }}
                                                className="text-slate-400 hover:text-[#E7473C] transition-colors"
                                                title="Compartir"
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-full flex items-center justify-center py-24">
                        <div className="text-center max-w-sm">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-slate-100 rounded-full">
                                    <FileText className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-slate-700 mb-1">
                                No hay investigaciones disponibles
                            </h3>
                            <p className="text-slate-500 text-sm">
                                No encontramos resultados con los criterios de búsqueda. Intenta con otros términos.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Load more */}
            {hasMore && !loading && (
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={() => setDisplayCount((c) => c + ITEMS_PER_PAGE)}
                        variant="outline"
                        className="border-slate-200 text-slate-600 hover:border-[#E7473C] hover:text-[#E7473C] transition-colors"
                    >
                        Cargar más · {filtered.length - displayCount} restantes
                    </Button>
                </div>
            )}
        </main>
    );
}
