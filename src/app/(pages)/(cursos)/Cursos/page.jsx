import Card from "@/app/components/Card";
import Image from "next/image";
import Link from "next/link";
import { iconClockwise, iconSearch } from "@/app/assets/icons";

const COURSES_CARDS = [{
    id: 1,
    image: "/images/curso1.png",
    title: "Qué es la Fisiología Digestiva",
    description: "Descripción del curso de Fisiología Digestiva.",
    url: "/Cursos/jinette-lopez"
}, {
    id: 2,
    image: "/images/curso2.png",
    title: "Aprende de Nutrición y Tecnología",
    description: "Psicóloga.",
    url: "/Cursos/kattia-agular"
}, {
    id: 3,
    image: "/images/curso3.png",
    title: "Mejora Tus Hábitos de Vida",
    description: "Bioeticista.",
    url: "/Cursos/maria-arguedas"
}, {
    id: 4,
    image: "/images/curso4.png",
    title: "Nutrición y Tecnología",
    description: "Investigadora del CIEM.",
    url: "/Cursos/maria-jose-chaves"
}, {
    id: 5,
    image: "/images/curso5.png",
    title: "Hábitos de Vida Saludables",
    description: "Investigadora.",
    url: "/Cursos/brenda-mesen"
}, {
    id: 6,
    image: "/images/curso6.png",
    title: "Fisiología Digestiva y Nutrición",
    description: "Directora, Investigadora.",
    url: "/Cursos/carolina-rojas"
}];

export default function Cursos() {
    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Cursos</h1>
            <p className="mt-3 mb-5">
                Encuentra aquí los cursos que imparten cada una de las integrantes de la 
                Red de Mujeres Académicas, con su información relevante.
            </p>
            <div className="flex items-stretch gap-3 mb-3">
                <button className="bg-[#E7473C] text-white p-2 rounded text-nowrap px-4
                hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                    Añadir Curso
                </button>
                <span>
                    <select
                        defaultValue=""
                        className="bg-[#ffffff] py-2 px-2 rounded h-full border border-gray-300"
                    >
                        <option value="" disabled>Filtrar Por</option>
                        <option value="temas">Temas</option>
                    </select>
                </span>
                <span className="flex w-full">
                    <input
                        type="search"
                        placeholder="Buscar..."
                        className="bg-[#ffffff] py-2 px-3 rounded-l w-full border border-gray-300"
                    />
                    <button className="bg-[#E7473C] text-white py-2 px-3 rounded-r text-sm 
                    hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                        {iconSearch({})}
                    </button>
                </span>
                <button className="bg-[#E7473C] text-white py-2 px-3 rounded
                hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                    {iconClockwise({})}
                </button>
            </div>
            <div className="flex gap-5 flex-wrap mt-5">
                {COURSES_CARDS.map((card) => (
                    <div key={card.id} className="flex-fill flex-grow flex-shrink basis-[30%] min-w-[250px]">
                        <Card
                            cardImage={card.image}
                            cardTitle={card.title}
                            cardDescription={card.description}
                            cardURL={card.url}
                            cardBgColor="#E7473C"
                            cardTitleTextColor="#F0F0F0"
                            cardTextColor="#F0F0F0"
                        />
                    </div>
                ))}
            </div>
        </main>
    );
}