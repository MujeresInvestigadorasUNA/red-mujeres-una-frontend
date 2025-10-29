"use client";
import { iconCalendar, iconPenSquare, iconSearch } from "@/app/assets/icons";
import { Calendar } from "@/components/ui/calendar";
import { getCourseById } from "@/lib/api/courses";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

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

    const fetchCourseInfo = async () => {
        try {
            const response = await getCourseById({ course_id: courseId });
            const data = await response.json();
            setCourse({
                title: data.title || "",
                photo: data.photo || "",
                description: data.description || "",   
                taughtBy: data.user.first_name + " " + data.user.last_name || "",
                startDate: data.initial_date || "",
                endDate: data.final_date || "",
                maxRegistrationDate: data.max_registration_date || "",
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
            <hr className="my-10" />
            <section className="px-20 py-10">
                <h2 className="text-2xl font-bold mb-5">Cursos Relacionados</h2>
                <div className="flex gap-4 mt-5">
                    <div className="w-full">
                        <label htmlFor="filtro-cursos" className="font-semibold">Filtrar Cursos:</label>
                        <input type="text" id="filtro-cursos" placeholder="Buscar..." className="rounded border border-gray-300 px-3 py-2 w-full mt-2" />
                    </div>
                    <div className="w-70">
                        <label htmlFor="filtro-cursos" className="font-semibold">Filtrar Por:</label>
                        <select id="filtro-cursos" className="rounded border border-gray-300 px-3 py-2 w-full mt-2">
                            <option value="todos">Todos</option>
                            <option value="temas">Temas</option>
                            <option value="autoras">Autoras</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-5 flex-wrap mt-5">
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 mt-5 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 mt-5 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 mt-5 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                </div>
            </section>
            <hr className="my-10" />
            <section className="flex gap-20 justify-between mt-10 px-20 py-10">
                <div>
                    <h1 className="text-2xl font-bold">jinette López</h1>
                    <p className="text-gray-600">Catedrática de Fisiología.</p>
                    <p className="mt-3">
                        jinette Aranda Ramírez es catedrática de Fisiología y doctora en
                        Farmacia con una amplia trayectoria docente e investigadora. <br /> <br />

                        Lleva a cabo su labor de investigadora en el Grupo de Investigación
                        «Fisiología digestiva y nutrición» y el «Instituto Universitario de
                        Nutrición y Tecnología de los Alimentos» de la Universidad de Granada
                        y sus líneas de investigación se centran en las interacciones
                        fármacos-nutrientes, en la valoración del estado nutricional en
                        poblaciones en situaciones patológicas y en la educación en hábitos
                        de vida saludable. Desde el año 2002 hasta la actualidad ha participado
                        como Investigadora Principal en ocho proyectos y contratos de investigación.
                    </p>
                    <button className="bg-gray-800 text-white py-2 px-4 rounded mt-3">
                        Ver Foro Personal
                    </button>
                </div>
                <Image
                    src="/images/jinette.png"
                    alt="jinette López"
                    width={300}
                    height={300}
                    className="object-cover rounded w-full h-100 mt-5 max-w-100 max-h-[300px] min-h-[300px] mb-3"
                />
            </section>
        </main>
    );
}