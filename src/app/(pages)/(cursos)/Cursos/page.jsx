"use client";
import { useUser } from "@/app/contexts/UserContext";
import { Heart, Share2, BookOpen, Search, RefreshCw, FileText } from "lucide-react"
import { toast } from "sonner";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { getCourses, getPublicCourses, likeCourse, unlikeCourse } from "@/lib/api/courses";
import { iconEye } from "@/app/assets/icons";

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

export default function Cursos() {
    const { user } = useUser();
    const [allCourses, setAllCourses] = useState([]);
    const [displayedCourses, setDisplayedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [searchQuery, setSearchQuery] = useState("");
    const [likedCourses, setLikedCourses] = useState(new Set());
    const ITEMS_PER_PAGE = 9;

    const fetchCourses = async () => {
        try {
            const response = await getPublicCourses(100);
            const data = await response.json();
            setAllCourses(data);
            setDisplayedCourses(data.slice(0, ITEMS_PER_PAGE));
        }
        catch (error) {
            toast.error("Error al cargar los cursos.");
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleLoadMore = async () => {
        setLoadingMore(true);
        setTimeout(() => {
            const newDisplayCount = displayCount + ITEMS_PER_PAGE;
            setDisplayedCourses(allCourses.slice(0, newDisplayCount));
            setDisplayCount(newDisplayCount);
            setLoadingMore(false);
        }, 300);
    };

    const applyFilter = (courses, query) => {
        if (!query.trim()) {
            return courses;
        }

        const lowerQuery = query.toLowerCase();

        return courses.filter((course) =>
            course.instructor?.toLowerCase().includes(lowerQuery) ||
            course.user_name?.toLowerCase().includes(lowerQuery) ||
            course.title?.toLowerCase().includes(lowerQuery)
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

    const handleShareCourse = (courseId) => {
        const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/Cursos/${courseId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success("URL copiada al portapapeles");
        }).catch(() => {
            toast.error("Error al copiar la URL");
        });
    };

    const handleLikeCourse = async (courseId) => {
        if (!user) {
            toast.error("Debes iniciar sesión para dar like");
            return;
        }

        try {
            const isLiked = likedCourses.has(courseId);
            let response;

            if (isLiked) {
                response = await unlikeCourse(user.id, courseId);
                if (response?.success) {
                    setLikedCourses((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(courseId);
                        return newSet;
                    });
                    toast.success("Dislike registrado");
                }
            } else {
                response = await likeCourse(user.id, courseId);
                if (response?.success) {
                    setLikedCourses((prev) => new Set(prev).add(courseId));
                    toast.success("Like registrado");
                }
            }
        } catch (error) {
            toast.error("Error al procesar el like");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const q = searchQuery.toLowerCase().trim();
    const filtered = allCourses.filter(
        (course) =>
            !q ||
            course.instructor?.toLowerCase().includes(q) ||
            course.user_name?.toLowerCase().includes(q) ||
            course.title?.toLowerCase().includes(q)
    );
    const displayed = filtered.slice(0, displayCount);
    const hasMore = filtered.length > displayCount;

    return (
        <main className="flex-grow h-[100%]">
            <section
                className="px-6 md:px-16 xl:px-20 py-8"
                style={{ background: "linear-gradient(135deg, #831d16, #E7473C)" }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wide">
                        Educación
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">Cursos</h1>
                <p className="text-white/70 text-sm mt-1 max-w-xl leading-relaxed">
                    Encuentra aquí los cursos que imparten cada una de las integrantes de la Red de Mujeres Académicas, con su información relevante.
                </p>
            </section>

            <div className="px-6 md:px-16 xl:px-20 py-8">
            <div className="flex gap-2 mb-5 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                        placeholder="Buscar cursos..."
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

            {!loadingCourses && (
                <p className="text-xs text-slate-400 mb-5">
                    {filtered.length} curso{filtered.length !== 1 ? "s" : ""}
                    {searchQuery && ` para "${searchQuery}"`}
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
                {loadingCourses ? (
                    [...Array(9)].map((_, i) => (
                        <Card key={i} className="p-0 overflow-hidden border border-slate-100 shadow-sm flex flex-col gap-0">
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
                    ))
                ) : displayed.length > 0 ? (
                    displayed.map((course) => {
                        const [from, to] = COVER_GRADIENTS[(String(course.id || "").charCodeAt(0) || 0) % COVER_GRADIENTS.length];
                        const authorName = course.instructor || course.user_name || "Instructor";
                        const initials = getInitials(authorName);

                        return (
                            <Link key={course.id} href={`/Cursos/${course.id}`} className="block group">
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

                                        {/* Book icon */}
                                        <BookOpen
                                            className="w-14 h-14 text-white/25 group-hover:text-white/35 transition-all duration-300 group-hover:scale-110"
                                            strokeWidth={1}
                                        />
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
                                            {course.title || "Sin título"}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-slate-500 line-clamp-3 flex-1 leading-relaxed">
                                            {course.description || "Sin descripción disponible."}
                                        </p>

                                        {/* Stats footer */}
                                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleLikeCourse(course.id); }}
                                                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Heart className={`w-3.5 h-3.5 ${likedCourses.has(course.id) ? "fill-current text-red-500" : ""}`} />
                                                    <span className="text-xs">0</span>
                                                </button>
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    {iconEye({ size: 14 })}
                                                    <span className="text-xs">{course.visits_count || 0}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleShareCourse(course.id); }}
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
                                    <BookOpen className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-slate-700 mb-1">
                                No hay cursos disponibles
                            </h3>
                            <p className="text-slate-500 text-sm">
                                No encontramos resultados con los criterios de búsqueda. Intenta con otros términos.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {displayCount < allCourses.length && !loadingCourses && (
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
            </div>
        </main>
    );
}