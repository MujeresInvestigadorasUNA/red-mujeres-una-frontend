"use client";
import { useUser } from "@/app/contexts/UserContext";
import { iconClockwise } from "@/app/assets/icons";
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { createCourse, getCoursesByUserId } from "@/lib/api/courses";
import CustomCard2 from "@/app/components/CustomCard2";

export default function MisCursos() {
    const { user } = useUser();
    const [courses, setCourses] = useState([]);

    const fetchCourses = async () => {
        try {
            const response = await getCoursesByUserId({ user_id: user.id });
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchCourses();
        }
    }, [user]);

    const handleOnAddCourse = async () => {
        try {
            const response = await createCourse({ user_id: user.id });
            if (response.ok) {
                fetchCourses();
            } else {
                console.error("Error creating course:", response.statusText);
            }
        } catch (error) {
            console.error("Error creating course:", error);
        }
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <div className="flex gap-3 mb-5">
                <Button
                    onClick={handleOnAddCourse}
                    className="bg-[#E7473C] hover:bg-[#831d16] text-white
                    hover:text-white hover:cursor-pointer rounded"
                >
                    Agregar Curso
                </Button>
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
                {courses.map((course, index) => (
                    <CustomCard2
                        key={index}
                        cardHref={`/MisCursos/${course.id}`}
                        cardTitle={course.title}
                        cardDescription={course.description}
                        cardImage={course.photo}
                    />
                ))}
            </div>
        </main>
    );
}