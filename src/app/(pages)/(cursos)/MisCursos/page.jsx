"use client";
import { useUser } from "@/app/contexts/UserContext";
import { iconClockwise } from "@/app/assets/icons";
import { SearchIcon, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";
import { createCourse, getCoursesByUserId, likeCourse, unlikeCourse } from "@/lib/api/courses";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const truncateDescription = (text, limit = 60) => {
    if (!text) return "Sin descripción disponible";
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
};

export default function MisCursos() {
    const { user } = useUser();
    const [allCourses, setAllCourses] = useState([]);
    const [displayedCourses, setDisplayedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [likedCourses, setLikedCourses] = useState(new Set());
    const ITEMS_PER_PAGE = 6;

    const userId = useMemo(() => user?.id ?? user?.user_id ?? null, [user]);

    const fetchCourses = async () => {
        if (!userId) {
            setLoadingCourses(false);
            return;
        }

        try {
            const response = await getCoursesByUserId({ user_id: userId });
            const data = await response.json();
            setAllCourses(data);
            setDisplayedCourses(data.slice(0, ITEMS_PER_PAGE));
        }
        catch (error) {
            console.error("Error al cargar los cursos:", error);
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
        
        return courses.filter((course) => {
            switch (filterType) {
                case "titulo":
                    return course.title?.toLowerCase().includes(lowerQuery) || false;
                case "descripcion":
                    return course.description?.toLowerCase().includes(lowerQuery) || false;
                case "fechaInicio":
                    return course.startDate?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(allCourses, searchQuery);
        setDisplayedCourses(filtered.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedCourses(allCourses.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleRefresh = () => {
        setSearchQuery("");
        setFilterType("");
        setDisplayedCourses(allCourses.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    useEffect(() => {
        setLoadingCourses(true);
        fetchCourses();
    }, [userId]);

    const handleShareCourse = (courseId) => {
        const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/MisCursos/${courseId}`;
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

    const handleOnAddCourse = async () => {
        try {
            const response = await createCourse({ user_id: userId });
            if (response.ok) {
                toast.success("Curso creado correctamente.");
                fetchCourses();
            } else {
                console.error("Error creating course:", response.statusText);
                toast.error("Error al crear el curso.");
            }
        } catch (error) {
            console.error("Error creating course:", error);
            toast.error("Error al crear el curso.");
        }
    };

    return (
        <main className="flex-grow px-20 py-10 h-screen toolsSection">
            <div className="flex gap-3 mb-5">
                <Button
                    onClick={handleOnAddCourse}
                    className="bg-[#E7473C] hover:bg-[#831d16] text-white
                    hover:text-white hover:cursor-pointer rounded"
                >
                    Agregar Curso
                </Button>
                <Select value={filterType} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Filtrar Por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="titulo">Nombre</SelectItem>
                            <SelectItem value="descripcion">Descripción</SelectItem>
                            <SelectItem value="fechaInicio">Fecha Inicio</SelectItem>
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
                    onClick={handleRefresh}
                    className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                    hover:text-[#831d16] hover:cursor-pointer shadow"
                >
                    {iconClockwise({})}
                </Button>
            </div>
            <div className="flex flex-wrap gap-3">
                {loadingCourses ? (
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : displayedCourses.length > 0 ? (
                    displayedCourses.map((course) => {
                        const gradients = [
                            "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
                            "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
                            "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
                            "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
                            "bg-gradient-to-r from-[#E7473C] to-[#c2372d]",
                            "bg-gradient-to-r from-[#FF6B55] to-[#831d16]",
                        ];
                        const gradientIndex = (String(course.id || '').charCodeAt(0) || 0) % gradients.length;
                        const gradient = gradients[gradientIndex];

                        return (
                            <Link key={course.id} href={`/MisCursos/${course.id}`} className="grow">
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
                                                    {course.title || "Sin título"}
                                                </h3>
                                                <p className="text-sm opacity-90 line-clamp-1">
                                                    Tu curso
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col">
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                                            {truncateDescription(course.description)}
                                        </p>

                                        {/* Stats Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex gap-4 text-sm">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleLikeCourse(course.id);
                                                    }}
                                                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Heart 
                                                        className={`w-4 h-4 ${likedCourses.has(course.id) ? "fill-current text-red-500" : ""}`}
                                                    />
                                                    <span className="text-xs">0</span>
                                                </button>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleShareCourse(course.id);
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
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v16a1 1 0 01-1.55.894L12 17.69l-4.45 3.104A1 1 0 016 20V4z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No hay cursos disponibles
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Aún no has creado ningún curso. ¡Comienza a compartir tu conocimiento!
                            </p>
                            <Button
                                className="bg-[#E7473C] hover:bg-[#831d16] text-white
                                hover:text-white hover:cursor-pointer rounded"
                                onClick={handleOnAddCourse}
                            >
                                + Crear tu primer curso
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {displayCount < allCourses.length && !loadingCourses && (
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