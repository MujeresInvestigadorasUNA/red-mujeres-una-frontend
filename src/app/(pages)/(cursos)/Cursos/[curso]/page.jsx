import Image from "next/image";
import Link from "next/link";

export default function Curso() {
    return (
        <main className="flex-grow h-[100%]">
            <section className="relative w-full h-[400px]">
                <Image
                    src="/images/curso6.png"
                    alt="Curso 1"
                    fill
                    className="object-cover brightness-50"
                />
                <div className="absolute inset-0 flex flex-col gap-5 items-center justify-center">
                    <h1 className="text-white text-5xl font-bold">
                        Qué es la Fisiología Dígestiva
                    </h1>
                    <button className="bg-gray-800 text-white px-4 py-2 rounded">
                        Inscribirse
                    </button>
                </div>
            </section>
            
            <div className="flex-grow px-20 py-10 h-[100%]">
                <section>
                    <h2 className="text-3xl font-bold mb-5">Descripción del Curso</h2>
                    <div className="flex flex-wrap gap-10 mt-8">
                        <div className="max-w-[40vw] flex-grow w-full">
                            <span className="flex gap-2 justify-start items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                </svg>
                                <h5 className="font-bold">Descripción</h5>
                            </span>
                            <p className="mt-2">
                                Este curso ofrece una introducción a la fisiología del
                                sistema digestivo, explorando sus funciones, órganos
                                involucrados y procesos clave como la digestión,
                                absorción de nutrientes y metabolismo.
                            </p>
                        </div>
                        <div className="max-w-[40vw] flex-grow w-full">
                            <span className="flex gap-2 justify-start items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-square-fill" viewBox="0 0 16 16">
                                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.93 4.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                                </svg>
                                <h5 className="font-bold">Detalles del Curso</h5>
                            </span>
                            <p className="mt-2">
                                Modalidad: El curso se impartirá de forma virtual a
                                través de la plataforma Teams de Microsoft. <br />
                                Hora: de 6:00 p.m. a 9:00 p.m.<br />
                                Días: L [ ] M [ ] MI [ ] J [ ] V [ ] S [ ] D [ ]<br />
                                Impartido por: jinette Aranda.<br />
                            </p>
                        </div>
                        <div className="max-w-[40vw] flex-grow w-full">
                            <span className="flex gap-2 justify-start items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-fill" viewBox="0 0 16 16">
                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5h16V4H0V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5" />
                                </svg>
                                <h5 className="font-bold">Fechas</h5>
                            </span>
                            <p className="mt-2">
                                Fecha máxima de inscripción: 03/08/2025. <br />
                                Fecha de Inicio: 12/08/2025.<br />
                                Fecha de Finalización: 12/10/2025.<br />
                            </p>
                        </div>
                        <div className="max-w-[40vw] flex-grow w-full">
                            <span className="flex gap-2 justify-start items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people-fill" viewBox="0 0 16 16">
                                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                                </svg>
                                <h5 className="font-bold">Cupos Totales</h5>
                            </span>
                            <p className="mt-2">
                                Este curso, cuenta con 20 cupos totales.
                            </p>
                        </div>
                    </div>
                </section>
                <hr className="my-10" />
                <section>
                    <h2 className="text-2xl font-bold mt-10 mb-5">Cursos Relacionados</h2>
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
                <section className="flex gap-20 justify-between mt-10">
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
            </div>
        </main>
    );
}