"use client";
import { getResearchers } from "@/lib/api/forums";
import { getProfilePictureUrl } from "@/lib/api/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, RefreshCw, Users } from "lucide-react";

const AVATAR_GRADIENTS = [
    ["#831d16", "#E7473C"],
    ["#1e3a8a", "#3b82f6"],
    ["#065f46", "#10b981"],
    ["#4c1d95", "#8b5cf6"],
    ["#92400e", "#f59e0b"],
    ["#0e7490", "#06b6d4"],
];

function getInitials(firstName, lastName) {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}

const ITEMS_PER_PAGE = 12;

export default function Foros() {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getResearchers(100);
                const arr = Array.isArray(data) ? data : [];

                // Obtener URLs firmadas para fotos en paralelo
                const signedPhotos = await Promise.all(
                    arr.map(async (r) => {
                        if (!r.photo) return null;
                        try {
                            const res = await getProfilePictureUrl({ user_id: r.id });
                            if (!res.ok) return null;
                            const d = await res.json();
                            return d?.url || d?.signed_url || d || null;
                        } catch {
                            return null;
                        }
                    })
                );

                setForums(arr.map((r, i) => ({ ...r, signedPhoto: signedPhotos[i] })));
            } catch (e) {
                console.error("Error fetching forums:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const q = searchQuery.toLowerCase().trim();
    const filtered = forums.filter(
        (f) =>
            !q ||
            `${f.first_name} ${f.last_name}`.toLowerCase().includes(q) ||
            f.user_profession?.toLowerCase().includes(q) ||
            f.user_description?.toLowerCase().includes(q)
    );
    const displayed = filtered.slice(0, displayCount);
    const hasMore = filtered.length > displayCount;

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleClear = () => {
        setSearchQuery("");
        setDisplayCount(ITEMS_PER_PAGE);
    };

    return (
        <main className="min-h-screen bg-slate-50">

            {/* ── Header ─────────────────────────────────────────── */}
            <section
                className="px-6 md:px-16 xl:px-20 py-8"
                style={{ background: "linear-gradient(135deg, #831d16, #E7473C)" }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wide">
                        Directorio
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">Foros de Investigadoras</h1>
                <p className="text-white/70 text-sm mt-1 max-w-xl leading-relaxed">
                    Conoce a las integrantes de la Red de Mujeres Académicas UNA, sus investigaciones y logros académicos.
                </p>
            </section>

            {/* ── Search + Grid ──────────────────────────────────── */}
            <section className="px-6 md:px-16 xl:px-20 py-8 max-w-7xl mx-auto">

                {/* Barra de búsqueda */}
                <div className="flex gap-2 mb-5 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre o profesión..."
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

                {/* Contador */}
                {!loading && (
                    <p className="text-xs text-slate-400 mb-5">
                        {filtered.length} investigadora{filtered.length !== 1 ? "s" : ""}
                        {searchQuery && ` para "${searchQuery}"`}
                    </p>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="p-4 border border-slate-100 flex items-start gap-3">
                                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                                <div className="flex flex-col gap-2 flex-1 pt-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-full mt-1" />
                                    <Skeleton className="h-3 w-4/5" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : displayed.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayed.map((forum, i) => {
                            const fullName = `${forum.first_name} ${forum.last_name}`;
                            const [gradFrom, gradTo] = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
                            return (
                                <Link key={forum.id || i} href={`/Foros/${forum.id}`}>
                                    <Card className="p-4 border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group h-full flex flex-col gap-3">
                                        {/* Avatar + nombre */}
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center shadow-sm"
                                                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                                            >
                                                {forum.signedPhoto ? (
                                                    <img
                                                        src={forum.signedPhoto}
                                                        alt={fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white font-semibold text-sm">
                                                        {getInitials(forum.first_name, forum.last_name)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#555] transition-colors duration-200">
                                                    {fullName}
                                                </span>
                                                {forum.user_profession && (
                                                    <span className="text-xs text-slate-400 truncate">
                                                        {forum.user_profession}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        {forum.user_description && (
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                                                {forum.user_description}
                                            </p>
                                        )}

                                        <span className="text-[11px] text-[#E7473C] font-medium group-hover:underline mt-auto">
                                            Ver perfil →
                                        </span>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">No se encontraron investigadoras</p>
                        {searchQuery && (
                            <p className="text-xs text-slate-400 mt-1">
                                Intenta con otro término de búsqueda
                            </p>
                        )}
                    </div>
                )}

                {/* Cargar más */}
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
            </section>
        </main>
    );
}
