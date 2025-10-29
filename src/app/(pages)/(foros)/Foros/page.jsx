"use client";
import { iconClockwise, iconSearch } from "@/app/assets/icons";
import CustomCard from "@/app/components/CustomCard";
import { useUser } from "@/app/contexts/UserContext";
import { getForums } from "@/lib/api/forums";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FORUMS_CARDS = [{
    id: 1,
    image: "/images/jinette.png",
    title: "Jinette Naranjo",
    description:
        "Jinette Naranjo es catedrática de Fisiología y doctora en Farmacia con una amplia trayectoria docente e investigadora.",
    url: "/Foros/jinette-naranjo"
}, {
    id: 2,
    image: "/images/kattia.png",
    title: "Kattia Vasconcelos ",
    description:
        "Kattia Vasconcelos es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros/kattia-vasconcelos"
}, {
    id: 3,
    image: "/images/mildred.png",
    title: "Mildred Arguedas",
    description:
        "Bioeticista con amplia experiencia en ética de la investigación y la atención en salud.",
    url: "/Foros/mildred-arguedas"
}, {
    id: 4,
    image: "/images/anayudel.png",
    title: "Anayudel Gutierrez",
    description:
        "Investigadora del CIEM con un enfoque en estudios de género y políticas públicas.",
    url: "/Foros/anayudel-gutierrez"
}, {
    id: 5,
    image: "/images/brenda.png",
    title: "Brenda Jiménez",
    description:
        "Investigadora con experiencia en ciencias sociales y desarrollo comunitario.",
    url: "/Foros/brenda-jimenez"
}];

export default function Foros() {
    const { user } = useUser();
    const [forums, setForums] = useState([]);

    const fetchForums = async () => {
        const response = await getForums();
        if (response.ok) {
            const data = await response.json();
            setForums(data);
        } else {
            toast.error("Error al cargar los foros");
        }
    };

    useEffect(() => {
        fetchForums();
    }, []);

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Foros</h1>
            <p className="mt-3 mb-5">
                Encuentra aquí los foros de cada una de las integrantes de la
                Red de Mujeres Académicas, con su información más relevante, sus logros
                y sus investigaciones.
            </p>
            <div className="flex items-stretch gap-3 mb-3">
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
                {forums.map((forum, index) => (
                    <div key={index} className="flex-fill flex-grow flex-shrink basis-[30%] min-w-[250px]">
                        <CustomCard
                            cardImage={forum?.user?.photo}
                            cardTitle={forum.user?.first_name + " " + forum.user?.last_name}
                            cardDescription={forum.user_description}
                            cardURL={`/Foros/${forum.user_id}`}
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