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
    const [research, setResearch] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResearch = async () => {
            setLoading(true);
            const data = await getResearch(0);
            setResearch(data);
            setLoading(false);
        };
        fetchResearch();
    }, []);

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Investigaciones</h1>
            <p className="mt-3 mb-5">
                Encuentra aquí todas las investigaciones realizadas por cada una de las
                integrantes de la Red de Mujeres Académicas, con su información más relevante.
            </p>
            <div className="flex gap-3 mb-5">
                <Select className="bg-[#fff] rounded">
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Seleccionar Filtro" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="title">Titulo</SelectItem>
                            <SelectItem value="content">Contenido</SelectItem>
                            <SelectItem value="topics">Temas</SelectItem>
                            <SelectItem value="isPublic">Estado</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <ButtonGroup className="rounded bg-[#fff] w-full">
                    <Input
                        className="rounded"
                        placeholder="Search..."
                    />
                    <Button
                        className="bg-[#E7473C] hover:bg-[#831d16] rounded text-white
                        hover:text-white hover:cursor-pointer"
                        variant="outline"
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </Button>
                </ButtonGroup>
                <Button className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                hover:text-[#831d16] hover:cursor-pointer shadow">
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
                ) : research.length > 0 ? (
                    research.map((item) => (
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
                                <CardContent className="relative p-0 rounded bg-[#000]">
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
                    <p>No hay investigaciones disponibles</p>
                )}
            </div>
        </main>
    );
}