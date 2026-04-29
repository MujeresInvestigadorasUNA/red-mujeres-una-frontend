"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { getResearch } from "@/lib/api/research";

const PLACEHOLDER_IMAGES = [
    "/images/curso1.png",
    "/images/curso2.png",
    "/images/curso3.png",
];

const PLACEHOLDER_DESCRIPTION = "Exploración detallada de esta investigación académica de la Red de Mujeres Académicas.";

export default function Investigacion() {
    const params = useParams();
    const researchId = params.investigacion;
    
    const [currentResearch, setCurrentResearch] = useState(null);
    const [relatedResearch, setRelatedResearch] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResearchData = async () => {
            try {
                setLoading(true);
                // Fetch all research without limit to ensure we find the target research
                const allResearch = await getResearch(null);
                
                // Find the current research by ID (convert both to string for comparison)
                const current = allResearch.find(r => String(r.id) === String(researchId));
                setCurrentResearch(current);
                
                // Get related research (all except current)
                const related = allResearch.filter(r => String(r.id) !== String(researchId));
                setRelatedResearch(related);
                setDisplayedResearch(related);
            } catch (error) {
                console.error("Error fetching research data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (researchId) {
            fetchResearchData();
        }
    }, [researchId]);

    const applyFilter = (research, query) => {
        if (!query.trim()) {
            return research;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return research.filter((item) => {
            switch (filterType) {
                case "investigador":
                    return item.user_id?.toString().includes(lowerQuery) || false;
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(relatedResearch, searchQuery);
        setDisplayedResearch(filtered);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedResearch(relatedResearch);
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            {loading ? (
                <div className="text-center py-10">
                    <p>Cargando investigación...</p>
                </div>
            ) : currentResearch ? (
                <>
                    <h1 className="text-2xl font-bold">{currentResearch.title}</h1>
                    <p className="mt-3">
                        {currentResearch.description || PLACEHOLDER_DESCRIPTION}
                    </p>
                    <Image
                        src={currentResearch.vector_link || PLACEHOLDER_IMAGES[0]}
                        alt={currentResearch.title}
                        width={600}
                        height={400}
                        className="object-cover rounded mt-5 w-full max-h-[400px]"
                        onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGES[0];
                        }}
                    />
                    <p className="px-20 my-8">
                        {currentResearch.description || PLACEHOLDER_DESCRIPTION}
                    </p>
                    <div className="flex gap-3">
                        <Image
                            src={PLACEHOLDER_IMAGES[1]}
                            alt="Research"
                            width={600}
                            height={400}
                            className="object-cover rounded mt-5 w-full max-h-[400px]"
                        />
                        <Image
                            src={PLACEHOLDER_IMAGES[2]}
                            alt="Research"
                            width={600}
                            height={400}
                            className="object-cover rounded mt-5 w-full max-h-[400px]"
                        />
                    </div>
                    <p className="px-20 my-8">
                        Accede al archivo de investigación completo a través del enlace proporcionado para obtener información detallada.
                    </p>
                    <section>
                        <h2 className="text-2xl font-bold mt-10 mb-5">Investigaciones Relacionadas</h2>
                        <div className="flex gap-3 mb-5 mt-5">
                            <Select value={filterType} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                                    <SelectValue placeholder="Filtrar Por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="investigador">Investigador ID</SelectItem>
                                        <SelectItem value="titulo">Titulo</SelectItem>
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
                                    setDisplayedResearch(relatedResearch);
                                }}
                                className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                                hover:text-[#831d16] hover:cursor-pointer shadow"
                            >
                                {iconClockwise({})}
                            </Button>
                        </div>
                        <div className="flex gap-5 flex-wrap mt-5">
                            {displayedResearch.length > 0 ? (
                                displayedResearch.map((research, index) => (
                                    <div key={research.id} className="flex-grow">
                                        <Link href={`/Investigaciones/${research.id}`}>
                                            <Image
                                                src={research.vector_link || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                                                alt={research.title}
                                                width={300}
                                                height={200}
                                                className="object-cover rounded w-full h-100 mt-5 min-w-full max-h-[200px] min-h-[200px] mb-3 hover:brightness-80 transition cursor-pointer"
                                                onError={(e) => {
                                                    e.target.src = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
                                                }}
                                            />
                                            <p className="text-md font-bold hover:text-[#E7473C] transition">{research.title}</p>
                                        </Link>
                                        <p className="text-gray-600 text-sm">Investigador: {research.user_id}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 w-full text-center py-5">No hay investigaciones relacionadas disponibles.</p>
                            )}
                        </div>
                    </section>
                </>
            ) : (
                <div className="text-center py-10">
                    <p>Investigación no encontrada</p>
                </div>
            )}
        </main>
    );
}