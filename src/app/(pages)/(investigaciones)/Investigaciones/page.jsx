"use client";
import { useUser } from "@/app/contexts/UserContext";
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from "next/image";
import { iconClockwise, iconEye, iconHeart } from "@/app/assets/icons";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getResearch } from "@/lib/api/research";


export default function Investigaciones() {
    const { user } = useUser();
    const [allResearch, setAllResearch] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        const fetchResearch = async () => {
            setLoading(true);
            const data = await getResearch(100);
            setAllResearch(data);
            setDisplayedResearch(data.slice(0, ITEMS_PER_PAGE));
            setLoading(false);
        };
        fetchResearch();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        setTimeout(() => {
            const newDisplayCount = displayCount + ITEMS_PER_PAGE;
            setDisplayedResearch(allResearch.slice(0, newDisplayCount));
            setDisplayCount(newDisplayCount);
            setLoadingMore(false);
        }, 300);
    };

    const applyFilter = (research, query) => {
        if (!query.trim()) {
            return research;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return research.filter((item) => {
            switch (filterType) {
                case "investigador":
                    return item.author?.toLowerCase().includes(lowerQuery) || 
                           item.user_name?.toLowerCase().includes(lowerQuery) || 
                           false;
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(allResearch, searchQuery);
        setDisplayedResearch(filtered.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedResearch(allResearch.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Investigaciones</h1>
            <p className="mt-3 mb-5">
                Encuentra aquí todas las investigaciones realizadas por cada una de las
                integrantes de la Red de Mujeres Académicas, con su información más relevante.
            </p>
            <div className="flex gap-3 mb-5">
                <Select value={filterType} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Filtrar Por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="investigador">Investigador</SelectItem>
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
                        setDisplayedResearch(allResearch.slice(0, ITEMS_PER_PAGE));
                        setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                    hover:text-[#831d16] hover:cursor-pointer shadow"
                >
                    {iconClockwise({})}
                </Button>
            </div>
            <div className="flex flex-wrap gap-3">
                {loading ? (
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
                    displayedResearch.map((item) => (
                        <Link key={item.id} href={`/Investigaciones/${item.id}`} className="grow">
                            <Card
                                className="p-0 overflow-hidden rounded-lg
                                hover:brightness-80 hover:cursor-pointer shadow border-none
                                min-w-[300px]"
                            >
                                <CardHeader className="px-6 pt-7">
                                    <div className="flex items-center justify-between
                                    flex-wrap gap-2">
                                        <CardTitle className="text-nowrap">
                                            {item.title}
                                        </CardTitle>
                                        <div
                                            className="flex gap-5 text-sm text-gray-600
                                            text-nowrap"
                                            style={{ fontSize: "0.8rem" }}
                                        >
                                            <span
                                                className="flex items-center gap-1"
                                            >
                                                {iconHeart({ size: 12 })}
                                                0
                                            </span>
                                            <span
                                                className="flex items-center gap-1"
                                            >
                                                {iconEye({ size: 12 })}
                                                0
                                            </span>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        {item.description || "Sin descripción"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative p-0 rounded">
                                    <Image
                                        src={item.vector_link || "/images/curso1.png"}
                                        alt={item.title}
                                        width={3000}
                                        height={3000}
                                        className="object-cover brightness-80 max-h-60
                                        w-full"
                                        onError={(e) => {
                                            e.target.src = "/images/curso1.png";
                                        }}
                                    />
                                    {/* Overlay badges */}
                                    <div className="absolute bottom-5 left-4 flex gap-1">
                                        <Badge variant="secondary">
                                            Badge
                                        </Badge>
                                        <Badge variant="secondary">Badge</Badge>
                                        <Badge variant="secondary">Badge</Badge>
                                        <Badge variant="secondary">Badge</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
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
                                No hay investigaciones disponibles
                            </h3>
                            <p className="text-gray-500 text-sm">
                                No encontramos investigaciones con los criterios de búsqueda. Intenta con otros términos o filtros.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {displayCount < allResearch.length && !loading && (
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