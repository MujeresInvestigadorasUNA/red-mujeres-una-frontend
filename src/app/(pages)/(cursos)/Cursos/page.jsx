"use client";
import { useUser } from "@/app/contexts/UserContext";
import { iconClockwise } from "@/app/assets/icons";
import { SearchIcon } from "lucide-react"
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
import { useEffect, useState } from "react";
import CustomCard2 from "@/app/components/CustomCard2";
import { getCourses, getPublicCourses } from "@/lib/api/courses";
import { toast } from "sonner";

export default function Cursos() {
    const { user } = useUser();
    const [allCourses, setAllCourses] = useState([]);
    const [displayedCourses, setDisplayedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const ITEMS_PER_PAGE = 6;

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
        
        return courses.filter((course) => {
            switch (filterType) {
                case "instructor":
                    return course.instructor?.toLowerCase().includes(lowerQuery) || 
                           course.user_name?.toLowerCase().includes(lowerQuery) || 
                           false;
                case "titulo":
                    return course.title?.toLowerCase().includes(lowerQuery) || false;
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

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Cursos</h1>
            <p className="mt-3 mb-5">
                Encuentra aquí los cursos que imparten cada una de las integrantes de la 
                Red de Mujeres Académicas, con su información relevante.
            </p>
            <div className="flex gap-3 mb-5">
                <Select value={filterType} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Filtrar Por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="titulo">Titulo</SelectItem>
                            <SelectItem value="fechaInicio">Fecha de Inicio</SelectItem>
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
                        setDisplayedCourses(allCourses.slice(0, ITEMS_PER_PAGE));
                        setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                    hover:text-[#831d16] hover:cursor-pointer shadow"
                >
                    {iconClockwise({})}
                </Button>
            </div>
            <div className="flex flex-wrap gap-3">
                {loadingCourses ? (
                    <>
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="grow min-w-[300px]">
                                <div className="p-0 overflow-hidden rounded-lg border-none shadow">
                                    <div className="px-6 pt-7 pb-4">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-full mb-3" />
                                    </div>
                                    <div className="relative p-0 rounded bg-gray-100">
                                        <Skeleton className="h-60 w-full rounded-none" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : displayedCourses.length > 0 ? (
                    displayedCourses.map((course, index) => (
                        <CustomCard2
                            key={course.id || index}
                            cardHref={`/Cursos/${course.id}`}
                            cardTitle={course.title}
                            cardDescription={course.description}
                            cardImage={course.photo}
                        />
                    ))
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
                            <p className="text-gray-500 text-sm">
                                No encontramos cursos con los criterios de búsqueda. Intenta con otros términos o filtros.
                            </p>
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