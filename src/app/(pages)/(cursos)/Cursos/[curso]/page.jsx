"use client";
import { iconCalendar, iconPenSquare, iconSearch } from "@/app/assets/icons";
import { getCourseById, getCourses } from "@/lib/api/courses";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchIcon, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { iconClockwise, iconHeart, iconEye } from "@/app/assets/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const gradients = [
    "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
    "bg-gradient-to-br from-[#c2372d] to-[#E7473C]",
    "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
    "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
    "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
    "bg-gradient-to-br from-[#E7473C] to-[#c2372d]",
];

export default function Curso({ params }) {
    const { curso: courseId } = use(params);
    const [course, setCourse] = useState({
        title: "",
        description: "",
        taughtBy: "",
        startDate: "",
        endDate: "",
        maxRegistrationDate: "",
        maxQuotas: 0,
    });

    const [relatedCourses, setRelatedCourses] = useState([]);
    const [displayedCourses, setDisplayedCourses] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [loadingCourse, setLoadingCourse] = useState(true);

    const fetchCourseInfo = async () => {
        try {
            setLoadingCourse(true);
            const response = await getCourseById({ course_id: courseId });
            const data = await response.json();
            setCourse({
                title: data.title || "Título del Curso",
                description: data.description || "Descripción del curso no disponible.",   
                taughtBy: data.user.first_name + " " + data.user.last_name || "Nombre del Instructor",
                startDate: data.initial_date || "no disponible",
                endDate: data.final_date || "no disponible",
                maxRegistrationDate: data.max_registration_date || "no disponible",
                maxQuotas: data.max_quotas || 0
            });
            setLoadingCourse(false);
        }
        catch (error) {
            toast.error("Error al cargar la información del curso.");
            setLoadingCourse(false);
        }
    }

    useEffect(() => {
        fetchCourseInfo();
    }, []);

    useEffect(() => {
        const fetchRelatedCourses = async () => {
            try {
                setLoadingRelated(true);
                const allCourses = await getCourses();
                
                // Filter out the current course
                const related = allCourses.filter(c => c.id !== parseInt(courseId));
                setRelatedCourses(related);
                setDisplayedCourses(related);

                setRelatedCourses([]);
                setDisplayedCourses([]);

            } catch (error) {
                console.error("Error fetching related courses:", error);
                toast.error("Error al cargar cursos relacionados.");
            } finally {
                setLoadingRelated(false);
            }
        };
        
        if (courseId) {
            fetchRelatedCourses();
        }
    }, [courseId]);

    const applyFilter = (courses, query) => {
        if (!query.trim()) {
            return courses;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return courses.filter((course) => {
            switch (filterType) {
                case "instructor":
                    const instructorName = course.user 
                        ? `${course.user.first_name} ${course.user.last_name}`.toLowerCase()
                        : "";
                    return instructorName.includes(lowerQuery);
                case "titulo":
                    return course.title?.toLowerCase().includes(lowerQuery) || false;
                case "fechaInicio":
                    return course.initial_date?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(relatedCourses, searchQuery);
        setDisplayedCourses(filtered);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedCourses(relatedCourses);
    };


    return (
        <main className="flex-grow h-[100%]">
            {loadingCourse ? (
                <div className="flex flex-col">
                    {/* Gradient Header Skeleton */}
                    <section className="bg-gray-200 p-8 md:p-12">
                        <Skeleton className="h-12 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <div className="flex flex-wrap gap-4 mt-6">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </section>
                    <section className="flex-grow px-6 md:px-20 py-10">
                        <Skeleton className="h-80 w-full rounded-lg mb-8" />
                        <div className="flex gap-10">
                            <div className="flex-1">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-40 w-full rounded" />
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="flex flex-col">
                <section className="relative w-full">
                    {/* Gradient Header */}
                    <div className={`${gradients[(String(course.id || '').charCodeAt(0) || 0) % gradients.length]} p-8 md:p-12 text-white`}>
                        <div className="max-w-4xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 line-clamp-3">
                                {course.title || "Sin título"}
                            </h1>
                            <p className="text-lg opacity-90 mb-6">
                                Impartido por: <span className="font-semibold">{course.taughtBy}</span>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    {iconCalendar({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Inicio</p>
                                        <p className="font-semibold">{course.startDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {iconCalendar({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Finalización</p>
                                        <p className="font-semibold">{course.endDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {iconCalendar({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Registro Máximo</p>
                                        <p className="font-semibold">{course.maxRegistrationDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {iconSearch({ size: 16 })}
                                    <div>
                                        <p className="opacity-75 text-xs">Cupos</p>
                                        <p className="font-semibold">{course.maxQuotas}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="flex-grow px-6 md:px-20 py-12">
                    {/* Description Section */}
                    <div className="max-w-4xl mb-12">
                        <div className="flex gap-3 items-center mb-4">
                            {iconPenSquare({})}
                            <h2 className="text-2xl font-bold">Descripción del Curso</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-justify">
                            {course.description}
                        </p>
                    </div>
                </section>
                </div>
            )}
            <section className="px-20 pb-10">
                <h2 className="text-2xl font-bold mb-5">Cursos Relacionados</h2>
                <div className="flex gap-3 mb-5 mt-5">
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
                            setDisplayedCourses(relatedCourses);
                        }}
                        className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                        hover:text-[#831d16] hover:cursor-pointer shadow"
                    >
                        {iconClockwise({})}
                    </Button>
                </div>
                <div className="flex gap-5 flex-wrap mt-5">
                    {loadingRelated ? (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="flex-grow min-w-[300px]">
                                    <Card className="h-full overflow-hidden border-none shadow-md">
                                        <div className="bg-gray-200 h-24 flex-shrink-0"></div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <Skeleton className="h-6 w-3/4 mb-3" />
                                            <Skeleton className="h-4 w-full mb-2" />
                                            <Skeleton className="h-4 w-5/6 mb-4" />
                                            <div className="flex gap-4 mt-auto pt-4 border-t">
                                                <Skeleton className="h-4 w-12" />
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </>
                    ) : displayedCourses.length > 0 ? (
                        displayedCourses.map((course, index) => {
                            const gradient = gradients[(String(course.id || '').charCodeAt(0) || 0) % gradients.length];
                            const truncatedDescription = course.description?.length > 60 
                                ? course.description.substring(0, 60) + "..." 
                                : course.description || "Sin descripción disponible";
                            
                            return (
                                <Link key={course.id} href={`/Cursos/${course.id}`} className="flex-grow min-w-[300px]">
                                    <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                                        {/* Gradient Header */}
                                        <div className={`${gradient} p-6 text-white flex-shrink-0`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold line-clamp-2 mb-2">
                                                        {course.title || "Sin título"}
                                                    </h3>
                                                    <p className="text-sm opacity-90">
                                                        {course.user 
                                                            ? `${course.user.first_name} ${course.user.last_name}`
                                                            : "Instructor"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <p className="text-gray-700 text-sm mb-4 flex-grow">
                                                {truncatedDescription}
                                            </p>
                                            {/* Stats Footer */}
                                            <div className="flex gap-4 pt-4 border-t text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    {iconEye({ size: 12 })}
                                                    Más info
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="w-full flex items-center justify-center py-12">
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
                                    No hay cursos relacionados
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    No encontramos otros cursos relacionados en este momento.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}