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
import { Skeleton } from "@/components/ui/skeleton";
import { getResearch } from "@/lib/api/research";

const PLACEHOLDER_IMAGES = [
    "/images/curso1.png",
    "/images/curso2.png",
    "/images/curso3.png",
];

const PLACEHOLDER_DESCRIPTION = "Exploración detallada de esta investigación académica de la Red de Mujeres Académicas.";

const isValidImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const urlLower = url.toLowerCase();
    return imageExtensions.some(ext => urlLower.includes(ext));
};

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
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <Skeleton className="h-6 w-full mt-8" />
                    <Skeleton className="h-6 w-full" />
                    <div className="flex gap-3">
                        <Skeleton className="h-96 w-full rounded-lg" />
                        <Skeleton className="h-96 w-full rounded-lg" />
                    </div>
                </div>
            ) : currentResearch ? (
                <>
                    <h1 className="text-2xl font-bold">{currentResearch.title}</h1>
                    <p className="mt-3">
                        {currentResearch.description || PLACEHOLDER_DESCRIPTION}
                    </p>
                    <Image
                        src={isValidImageUrl(currentResearch.vector_link) ? currentResearch.vector_link : PLACEHOLDER_IMAGES[0]}
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
                            {relatedResearch.length === 0 ? (
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
                            ) : displayedResearch.length > 0 ? (
                                displayedResearch.map((research, index) => (
                                    <div key={research.id} className="flex-grow">
                                        <Link href={`/Investigaciones/${research.id}`}>
                                            <Image
                                                src={isValidImageUrl(research.vector_link) ? research.vector_link : PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
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
                                <div className="text-center max-w-md">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-4 bg-gray-100 rounded-full">
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        No hay investigaciones relacionadas
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        No encontramos otras investigaciones relacionadas en este momento.
                                    </p>
                                </div>
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