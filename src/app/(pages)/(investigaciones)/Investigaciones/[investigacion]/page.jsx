"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { getResearch, getResearchById } from "@/lib/api/research";

const PLACEHOLDER_IMAGES = [
    "/images/curso1.png",
    "/images/curso2.png",
    "/images/curso3.png",
];

const PLACEHOLDER_DESCRIPTION = "Exploración detallada de esta investigación académica de la Red de Mujeres Académicas.";

const hasValidSasToken = () => {
    return !!process.env.NEXT_PUBLIC_BLOB_CONTAINER_PDF_SAS_TOKEN;
};

const appendSasTokenIfNeeded = (url) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    const isAzureBlob = lowerUrl.includes("blob.core.windows.net") || lowerUrl.includes("dfs.core.windows.net");
    const hasSasToken = lowerUrl.includes("sig=") || lowerUrl.includes("se=") || lowerUrl.includes("sp=");

    if (isAzureBlob && !hasSasToken && hasValidSasToken()) {
        const token = process.env.NEXT_PUBLIC_BLOB_CONTAINER_PDF_SAS_TOKEN;
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}${token}`;
    }

    return url;
};

const canDisplayPdfInline = (url) => {
    if (!url) return false;

    const lowerUrl = url.toLowerCase();
    const isAzureBlob = lowerUrl.includes("blob.core.windows.net") || lowerUrl.includes("dfs.core.windows.net");
    const hasSasToken = lowerUrl.includes("sig=") || lowerUrl.includes("se=") || lowerUrl.includes("sp=");

    if (isAzureBlob && !hasSasToken) {
        return hasValidSasToken();
    }

    return true;
};

const isValidImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const urlLower = url.toLowerCase();
    return imageExtensions.some((ext) => urlLower.includes(ext));
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
                const [current, allResearch] = await Promise.all([
                    getResearchById(researchId),
                    getResearch(null),
                ]);

                const currentId = current?.id != null ? String(current.id) : String(researchId);

                const related = allResearch.filter((item) => String(item.id) !== currentId);
                setCurrentResearch(current);
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
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                case "descripcion":
                    return item.description?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return (
                        item.title?.toLowerCase().includes(lowerQuery) ||
                        item.description?.toLowerCase().includes(lowerQuery) ||
                        false
                    );
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
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-[600px] w-full rounded-lg" />
                    <Skeleton className="h-8 w-1/2 mt-8" />
                    <Skeleton className="h-6 w-full" />
                </div>
            ) : currentResearch ? (
                <>
                    <h1 className="text-2xl font-bold">{currentResearch.title}</h1>
                    <p className="mt-3 text-gray-700">
                        {currentResearch.description || PLACEHOLDER_DESCRIPTION}
                    </p>
                    <section className="mt-8 space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            {currentResearch.research_link && (
                                <Button asChild className="bg-[#E7473C] hover:bg-[#831d16] text-white">
                                    <a href={appendSasTokenIfNeeded(currentResearch.research_link)} target="_blank" rel="noreferrer">
                                        Abrir PDF
                                    </a>
                                </Button>
                            )}
                        </div>
                        {currentResearch.research_link && canDisplayPdfInline(currentResearch.research_link) ? (
                            <embed
                                src={appendSasTokenIfNeeded(currentResearch.research_link)}
                                type="application/pdf"
                                title={`${currentResearch.title} - PDF de investigación`}
                                className="w-full h-[90vh] rounded-lg border border-gray-200 bg-white"
                            />
                        ) : currentResearch.research_link ? (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-600 space-y-3">
                                <p className="font-medium text-gray-700">
                                    El archivo no puede mostrarse embebido porque el almacenamiento no permite acceso público.
                                </p>
                                <p className="text-sm">
                                    Abre el documento en una nueva pestaña o solicita una URL firmada para la vista previa.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500">
                                No hay un PDF disponible para esta investigación.
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mt-10 mb-5">Investigaciones Relacionadas</h2>
                        <div className="flex gap-3 mb-5 mt-5">
                            <Select value={filterType} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                                    <SelectValue placeholder="Filtrar Por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="titulo">Titulo</SelectItem>
                                        <SelectItem value="descripcion">Descripción</SelectItem>
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
                                                src={isValidImageUrl(research.vector_link) ? research.vector_link : PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                                                alt={research.title}
                                                width={300}
                                                height={200}
                                                className="object-cover rounded w-full h-100 mt-5 min-w-full max-h-[200px] min-h-[200px] mb-3 hover:brightness-80 transition cursor-pointer"
                                            />
                                            <p className="text-md font-bold hover:text-[#E7473C] transition">{research.title}</p>
                                        </Link>
                                        <p className="text-gray-600 text-sm">{research.description || PLACEHOLDER_DESCRIPTION}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full flex items-center justify-center py-20">
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