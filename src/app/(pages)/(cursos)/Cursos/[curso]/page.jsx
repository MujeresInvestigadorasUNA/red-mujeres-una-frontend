"use client";
import { iconCalendar, iconPenSquare, iconSearch } from "@/app/assets/icons";
import { Calendar } from "@/components/ui/calendar";
import { getCourseById, getCourses } from "@/lib/api/courses";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";
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
import { iconClockwise } from "@/app/assets/icons";

const PLACEHOLDER_IMAGES = [
    "/images/curso1.png",
    "/images/curso2.png",
    "/images/curso3.png",
];

export default function Curso({ params }) {
    const { curso: courseId } = use(params);
    const [course, setCourse] = useState({
        title: "",
        photo: "/images/curso1.png",
        description: "",
        taughtBy: "",
        startDate: "",
        endDate: "",
        maxRegistrationDate: "",
        maxQuotas: 0,
    });

    const [date, setDate] = useState(
        new Date(2025, 5, 12)
    );

    const [relatedCourses, setRelatedCourses] = useState([]);
    const [displayedCourses, setDisplayedCourses] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingRelated, setLoadingRelated] = useState(true);

    const fetchCourseInfo = async () => {
        try {
            const response = await getCourseById({ course_id: courseId });
            const data = await response.json();
            setCourse({
                title: data.title || "Título del Curso",
                photo: data.photo || "/images/defaultCourse.webp",
                description: data.description || "Descripción del curso no disponible.",   
                taughtBy: data.user.first_name + " " + data.user.last_name || "Nombre del Instructor",
                startDate: data.initial_date || "no disponible",
                endDate: data.final_date || "no disponible",
                maxRegistrationDate: data.max_registration_date || "no disponible",
                maxQuotas: data.max_quotas || 0
            });
        }
        catch (error) {
            toast.error("Error al cargar la información del curso.");
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
            <div className="flex flex-col ">
                <section className="relative w-full h-[400px]">
                    <div className="relative w-full h-full">
                        <Image
                            src={course.photo}
                            alt="Curso 1"
                            fill
                            className="object-cover brightness-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    {/* Centered Input */}
                    <div className="absolute inset-0 flex flex-col gap-5 items-center justify-center">
                        <h2
                            id="title"
                            name="title"
                            className="h-20 w-full text-white font-bold text-center border-0 shadow-none 
                            focus:outline-none focus:ring-0 focus:border-transparent"
                            style={{
                                fontSize: '3rem',
                                lineHeight: '1',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                            }}
                        >
                            {course.title}
                        </h2>
                    </div>
                </section>
                <section className="flex-grow h-[100%] px-20 py-10">
                    <div className="flex justify-between mb-5">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-bold text-wrap">
                                Datos del Curso
                            </h2>
                            <h3 className="text-gray-600 text-semibold text-nowrap
                            text-sm">
                                Impartido por: {course.taughtBy}
                            </h3>
                        </div>
                        <div className="flex gap-5">
                            <span className="flex items-center gap-2 text-sm text-gray-600
                            text-nowrap">
                                {iconCalendar({ size: 12 })} Fecha Inicial:
                                {" " + course.startDate}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-600
                            text-nowrap">
                                {iconCalendar({ size: 12 })} Fecha Final:
                                {" " + course.endDate}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-600
                            text-nowrap">
                                {iconCalendar({ size: 12 })} Fecha Máxima de Inscripción:
                                {" " + course.maxRegistrationDate}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-600
                            text-nowrap">
                                {iconSearch({ size: 12 })} Cupos Disponibles:
                                {" " + course.maxQuotas}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-10 mt-8 bg-gray-100 p-5 rounded-lg">
                        <div className="max-w-[60vw] flex-grow w-full">
                            <span className="flex gap-2 justify-start items-center">
                                {iconPenSquare({})}
                                <h5 className="font-bold">Descripción</h5>
                            </span>
                            <p
                                className="p-0 mt-3 border-0 shadow-none resize-none
                                min-h-[10rem] h-[92%]"
                                style={{ fontSize: '1rem' }}
                            >
                                {course.description}
                            </p>
                        </div>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            buttonVariant="ghost"
                            className="rounded-lg border [--cell-size:--spacing(11)] 
                            md:[--cell-size:--spacing(12)] flex-grow
                            max-w-[500px]"
                        />
                    </div>
                </section>
            </div>
            <section className="px-20 py-10">
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
                        <p className="text-gray-600 w-full text-center py-5">Cargando cursos relacionados...</p>
                    ) : displayedCourses.length > 0 ? (
                        displayedCourses.map((course, index) => (
                            <div key={course.id} className="flex-grow">
                                <Link href={`/Cursos/${course.id}`}>
                                    <Image
                                        src={course.photo || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                                        alt={course.title}
                                        width={300}
                                        height={200}
                                        className="object-cover rounded w-full h-100 mt-5 min-w-full max-h-[200px] min-h-[200px] mb-3 hover:brightness-80 transition cursor-pointer"
                                        onError={(e) => {
                                            e.target.src = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
                                        }}
                                    />
                                    <p className="text-md font-bold hover:text-[#E7473C] transition">{course.title}</p>
                                </Link>
                                <p className="text-gray-600 text-sm">{course.description || "Sin descripción disponible"}</p>
                                {course.user && (
                                    <p className="text-gray-500 text-xs">Por: {course.user.first_name} {course.user.last_name}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 w-full text-center py-5">No hay cursos relacionados disponibles.</p>
                    )}
                </div>
            </section>
        </main>
    );
}