"use client";
import { useUser } from "@/app/contexts/UserContext";
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
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
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from "next/image";
import { iconClockwise, iconEye, iconHeart } from "@/app/assets/icons";

import { HeartIcon } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function MisInvestigaciones() {
    const { user } = useUser();

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <div className="flex gap-3 mb-5">
                <Button className="bg-[#E7473C] hover:bg-[#831d16] text-white
                hover:text-white hover:cursor-pointer rounded">
                    Agregar Investigación
                </Button>
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
                <Link href={`/MisInvestigaciones/1`} className="grow">
                    <Card 
                        className="p-0 overflow-hidden rounded-lg
                        hover:brightness-80 hover:cursor-pointer shadow border-none
                        min-w-[300px]"
                    >
                        <CardHeader className="px-6 pt-7">
                            <div className="flex items-center justify-between
                            flex-wrap gap-2">
                                <CardTitle className="text-nowrap">
                                    Investigación Titulo
                                </CardTitle>
                                <div 
                                    className="flex gap-5 text-sm text-gray-600
                                    text-nowrap"
                                    style={{fontSize: "0.8rem"}}
                                >
                                    <span
                                        className="flex items-center gap-1"
                                    >
                                        {iconHeart({ size: 12 })}
                                        100
                                    </span>
                                    <span
                                        className="flex items-center gap-1"
                                    >
                                        {iconEye({ size: 12 })}
                                        100
                                    </span>
                                </div>
                            </div>
                            <CardDescription>
                                Descripción de la investigación lore
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative p-0 rounded bg-[#000]">
                            <Image
                                src="/images/curso1.png"
                                alt="Investigación"
                                width={3000}
                                height={3000}
                                className="object-cover brightness-80 max-h-60
                                w-full"
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
            </div>
        </main>
    );
}