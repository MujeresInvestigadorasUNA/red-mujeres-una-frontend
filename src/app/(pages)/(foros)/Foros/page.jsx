"use client";
import { iconClockwise, iconSearch } from "@/app/assets/icons";
import CustomCard from "@/app/components/CustomCard";
import { useUser } from "@/app/contexts/UserContext";
import { getResearchers } from "@/lib/api/forums";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FORUM_PLACEHOLDER_IMAGE = "/images/jinette.png";

export default function Foros() {
    const [forums, setForums] = useState([]);
    const [loadingForums, setLoadingForums] = useState(true);

    const fetchForums = async () => {
        try {
            const data = await getResearchers(0);
            if (data && data.length > 0) {
                setForums(data);
            } else {
                toast.error("No hay foros disponibles");
            }
        } catch (error) {
            console.error("Error fetching forums:", error);
            toast.error("Error al cargar los foros");
        } finally {
            setLoadingForums(false);
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
                {loadingForums ? (
                    <>
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="flex-fill flex-grow flex-shrink basis-[30%] min-w-[250px]">
                                <div className="p-4 rounded-lg bg-gray-100">
                                    <Skeleton className="h-40 w-full rounded-lg mb-3" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    forums.map((forum, index) => (
                        <div key={index} className="flex-fill flex-grow flex-shrink basis-[30%] min-w-[250px]">
                            <CustomCard
                                cardImage={forum?.photo || FORUM_PLACEHOLDER_IMAGE}
                                cardTitle={forum.first_name + " " + forum.last_name}
                                cardDescription={forum.user_description}
                                cardURL={`/Foros/${forum.id}`}
                                cardBgColor="#E7473C"
                                cardTitleTextColor="#F0F0F0"
                                cardTextColor="#F0F0F0"
                            />
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}