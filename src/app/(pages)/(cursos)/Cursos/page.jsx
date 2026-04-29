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

export default function Cursos() {
    const { user } = useUser();
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const fetchCourses = async () => {
        try {
            const response = await getPublicCourses();
            const data = await response.json();
            setCourses(data);
        }
        catch (error) {
            toast.error("Error al cargar los cursos.");
        } finally {
            setLoadingCourses(false);
        }
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
                <Select className="bg-[#fff] rounded">
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Seleccionar Filtro" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="title">Nombre</SelectItem>
                            <SelectItem value="description">Descripcion</SelectItem>
                            <SelectItem value="startDate">Fecha Inicio</SelectItem>
                            <SelectItem value="endDate">Fecha Final</SelectItem>
                            <SelectItem value="registrationEndDate">Fecha Final Inscripción</SelectItem>
                            <SelectItem value="spots">Cupos</SelectItem>
                            <SelectItem value="status">Estado</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <ButtonGroup className="rounded bg-[#fff] w-full">
                    <Input
                        className="rounded"
                        placeholder="Search..."
                    />
                    <Button
                        className="bg-[#E7473C] hover:bg-[#831d16] rounded text-white
                        hover:text-white hover:cursor-pointer"
                        variant="outline"
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </Button>
                </ButtonGroup>
                <Button className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                hover:text-[#831d16] hover:cursor-pointer shadow">
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
                ) : (
                    courses.map((course, index) => (
                        <CustomCard2
                            key={index}
                            cardHref={`/Cursos/${course.id}`}
                            cardTitle={course.title}
                            cardDescription={course.description}
                            cardImage={course.photo}
                        />
                    ))
                )}
            </div>
        </main>
    );
}