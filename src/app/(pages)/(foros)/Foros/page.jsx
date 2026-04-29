"use client";
import { iconClockwise } from "@/app/assets/icons";
import CustomCard from "@/app/components/CustomCard";
import { getResearchers } from "@/lib/api/forums";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";

const FORUM_PLACEHOLDER_IMAGE = "/images/jinette.png";

export default function Foros() {
    const [allForums, setAllForums] = useState([]);
    const [displayedForums, setDisplayedForums] = useState([]);
    const [loadingForums, setLoadingForums] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const ITEMS_PER_PAGE = 6;

    const fetchForums = async () => {
        try {
            const data = await getResearchers(100);
            if (data && data.length > 0) {
                setAllForums(data);
                setDisplayedForums(data.slice(0, ITEMS_PER_PAGE));
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

    const applyFilter = (forums, query) => {
        if (!query.trim()) {
            return forums;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return forums.filter((forum) => {
            switch (filterType) {
                case "nombre":
                    const fullName = `${forum.first_name} ${forum.last_name}`.toLowerCase();
                    return fullName.includes(lowerQuery);
                case "correo":
                    return forum.email?.toLowerCase().includes(lowerQuery) || false;
                case "profesion":
                    return forum.profession?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(allForums, searchQuery);
        setDisplayedForums(filtered.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedForums(allForums.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleLoadMore = async () => {
        setLoadingMore(true);
        setTimeout(() => {
            const newDisplayCount = displayCount + ITEMS_PER_PAGE;
            setDisplayedForums(allForums.slice(0, newDisplayCount));
            setDisplayCount(newDisplayCount);
            setLoadingMore(false);
        }, 300);
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
            <div className="flex gap-3 mb-5">
                <Select value={filterType} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Filtrar Por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="nombre">Nombre</SelectItem>
                            <SelectItem value="correo">Correo</SelectItem>
                            <SelectItem value="profesion">Profesión</SelectItem>
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
                        setDisplayedForums(allForums.slice(0, ITEMS_PER_PAGE));
                        setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                    hover:text-[#831d16] hover:cursor-pointer shadow"
                >
                    {iconClockwise({})}
                </Button>
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
                ) : displayedForums.length > 0 ? (
                    displayedForums.map((forum, index) => (
                        <div key={forum.id || index} className="flex-fill flex-grow flex-shrink basis-[30%] min-w-[250px]">
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
                ) : (
                    <div className="w-full text-center py-10">
                        <p className="text-gray-500 text-lg">No se encontraron foros.</p>
                    </div>
                )}
            </div>
            {displayCount < allForums.length && !loadingForums && (
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="bg-[#E7473C] hover:bg-[#831d16] rounded text-white
                        hover:text-white hover:cursor-pointer w-full"
                    >
                        {loadingMore ? "Cargando..." : "Cargar más"}
                    </Button>
                </div>
            )}
        </main>
    );
}