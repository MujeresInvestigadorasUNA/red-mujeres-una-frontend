"use client";
import { capitalizeWords } from "@/app/assets/utils";
import { getUser } from "@/lib/api/forums";
import { getResearchByUserId } from "@/lib/api/research";
import { getCoursesByUserId } from "@/lib/api/courses";
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

const FORUM_PLACEHOLDER_IMAGE = "/images/jinette.png";

export default function forum({ params }) {
    const [forum, setForum] = useState({
        first_name: "Nombre",
        last_name: "Apellidos",
        profession: "Profesión u Ocupación",
        description: "Biografía o descripción del forum...",
        photo: ""
    });
    const [research, setResearch] = useState([]);
    const [courses, setCourses] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [displayedCourses, setDisplayedCourses] = useState([]);
    const [loadingResearch, setLoadingResearch] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [researchFilterType, setResearchFilterType] = useState("");
    const [researchSearchQuery, setResearchSearchQuery] = useState("");
    const [coursesFilterType, setCoursesFilterType] = useState("");
    const [coursesSearchQuery, setCoursesSearchQuery] = useState("");
    const { foro: foroId } = use(params);

    const fetchForoData = async () => {
        try {
            const userData = await getUser({ user_id: foroId });

            if (!userData) {
                return toast.warning("Error al obtener el forum");
            }

            setForum({
                first_name: userData.first_name,
                last_name: userData.last_name,
                profession: userData.user_profession,
                description: userData.user_description,
                photo: userData.photo,
            });
        }
        catch (error) {
            console.error("Error fetching forum:", error);
            toast.error("Error al cargar el forum");
        }
    }

    const fetchResearch = async () => {
        try {
            setLoadingResearch(true);
            const researchData = await getResearchByUserId(foroId);
            const dataArray = Array.isArray(researchData) ? researchData : [];
            setResearch(dataArray);
            setDisplayedResearch(dataArray);
        } catch (error) {
            console.error("Error fetching research:", error);
            toast.error("Error al cargar investigaciones");
        } finally {
            setLoadingResearch(false);
        }
    }

    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const response = await getCoursesByUserId({ user_id: foroId });
            
            if (response.ok) {
                const coursesData = await response.json();
                const dataArray = Array.isArray(coursesData) ? coursesData : [];
                setCourses(dataArray);
                setDisplayedCourses(dataArray);
            } else {
                console.error("Error fetching courses:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Error al cargar cursos");
        } finally {
            setLoadingCourses(false);
        }
    }

    const applyResearchFilter = (researchData, query) => {
        if (!query.trim()) {
            return researchData;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return researchData.filter((item) => {
            switch (researchFilterType) {
                case "investigador":
                    return item.author?.toLowerCase().includes(lowerQuery) || 
                           item.user_name?.toLowerCase().includes(lowerQuery) || 
                           false;
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const applyCoursesFilter = (coursesData, query) => {
        if (!query.trim()) {
            return coursesData;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return coursesData.filter((course) => {
            switch (coursesFilterType) {
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

    const handleResearchSearch = () => {
        const filtered = applyResearchFilter(research, researchSearchQuery);
        setDisplayedResearch(filtered);
    };

    const handleCoursesSearch = () => {
        const filtered = applyCoursesFilter(courses, coursesSearchQuery);
        setDisplayedCourses(filtered);
    };

    const handleResearchFilterChange = (value) => {
        setResearchFilterType(value);
        setResearchSearchQuery("");
        setDisplayedResearch(research);
    };

    const handleCoursesFilterChange = (value) => {
        setCoursesFilterType(value);
        setCoursesSearchQuery("");
        setDisplayedCourses(courses);
    };

    useEffect(() => {
        if (foroId) {
            fetchForoData();
            fetchResearch();
            fetchCourses();
        }
    }, [foroId]);

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <section className="flex flex-col gap-5 justify-between">
                <div className="flex gap-10">
                    <div className="w-full">
                        <h2
                            className="text-2xl font-bold mb-3 flex gap-3 items-center group"
                            style={{ fontSize: '2rem' }}
                        >
                            {capitalizeWords(forum?.first_name + " " + forum?.last_name) || "Nombre Completo"}
                        </h2>
                        <h3
                            className="text-gray-600 font-semibold mb-1 flex gap-3 items-center group"
                            style={{ fontSize: '1rem' }}
                        >
                            {capitalizeWords(forum?.profession) || "Profesión u Ocupación"}
                        </h3>
                        <p
                            id="description"
                            name="description"
                            className="text-gray-600 mt-3 w-full h-80 border 
                            rounded border-0 p-0 shadow-none resize-none pr-3
                            text-sm"
                        >
                            {forum?.description || "Biografía o descripción del forum..."}
                        </p>
                    </div>
                    <div className="relative inline-block w-64 h-64 group">
                        <Image
                            src={forum?.photo || FORUM_PLACEHOLDER_IMAGE}
                            alt="Foto de perfil"
                            width={3000}
                            height={3000}
                            className="w-full h-full rounded object-cover
                            hover:cursor-pointer hover:brightness-95
                            transition-all duration-200"
                        />
                    </div>
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-bold mt-10 mb-5">Investigaciones Relacionadas</h2>
                <div className="flex gap-3 mb-5 mt-5">
                    <Select value={researchFilterType} onValueChange={handleResearchFilterChange}>
                        <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                            <SelectValue placeholder="Filtrar Por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="investigador">Investigador</SelectItem>
                                <SelectItem value="titulo">Titulo</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <ButtonGroup className="rounded bg-[#fff] w-full">
                        <Input
                            className="rounded"
                            placeholder="Buscar..."
                            value={researchSearchQuery}
                            onChange={(e) => setResearchSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleResearchSearch()}
                        />
                        <Button
                            onClick={handleResearchSearch}
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
                            setResearchSearchQuery("");
                            setResearchFilterType("");
                            setDisplayedResearch(research);
                        }}
                        className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                        hover:text-[#831d16] hover:cursor-pointer shadow"
                    >
                        {iconClockwise({})}
                    </Button>
                </div>
                <div className="flex gap-5 flex-wrap mt-5">
                    {loadingResearch ? (
                        <p className="text-gray-600">Cargando investigaciones...</p>
                    ) : displayedResearch.length > 0 ? (
                        displayedResearch.map((item) => (
                            <div key={item.id} className="flex-grow max-w-xs">
                                <div className="rounded border border-gray-300 p-3">
                                    <h3 className="text-md font-bold mb-2">{item.title}</h3>
                                    {item.research_link && (
                                        <a 
                                            href={item.research_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-words text-sm"
                                        >
                                            Ver Investigación
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">No hay investigaciones disponibles.</p>
                    )}
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-bold mt-10 mb-5">Cursos Relacionados</h2>
                <div className="flex gap-3 mb-5 mt-5">
                    <Select value={coursesFilterType} onValueChange={handleCoursesFilterChange}>
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
                            value={coursesSearchQuery}
                            onChange={(e) => setCoursesSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCoursesSearch()}
                        />
                        <Button
                            onClick={handleCoursesSearch}
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
                            setCoursesSearchQuery("");
                            setCoursesFilterType("");
                            setDisplayedCourses(courses);
                        }}
                        className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                        hover:text-[#831d16] hover:cursor-pointer shadow"
                    >
                        {iconClockwise({})}
                    </Button>
                </div>
                <div className="flex gap-5 flex-wrap mt-5">
                    {loadingCourses ? (
                        <p className="text-gray-600">Cargando cursos...</p>
                    ) : displayedCourses.length > 0 ? (
                        displayedCourses.map((course) => (
                            <div key={course.id} className="flex-grow max-w-xs">
                                {course.photo && (
                                    <Image
                                        src={course.photo}
                                        alt={course.title}
                                        width={300}
                                        height={200}
                                        className="object-cover rounded w-full h-100 mt-5 min-w-full max-h-[200px] min-h-[200px] mb-3"
                                    />
                                )}
                                <Link href={`/cursos/${course.id}`} className="text-md font-bold">{course.title}</Link>
                                <p className="text-gray-600 text-sm">{course.description}</p>
                                <p className="text-gray-500 text-xs mt-1">Modalidad: {course.modality}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">No hay cursos disponibles.</p>
                    )}
                </div>
            </section>
        </main>
    );
}