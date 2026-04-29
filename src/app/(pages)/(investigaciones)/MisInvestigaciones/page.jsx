"use client";
import { useUser } from "@/app/contexts/UserContext";
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { useMemo, useRef, useState, useEffect } from "react";
import { UploadCloudIcon } from "lucide-react";
import { createResearch, getResearchByUserId } from "@/lib/api/research";
import { toast } from "sonner";

export default function MisInvestigaciones() {
    const { user, accessToken } = useUser();
    const fileInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [document, setDocument] = useState(null);
    const [allResearch, setAllResearch] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const ITEMS_PER_PAGE = 6;

    const userId = useMemo(() => user?.id ?? user?.user_id ?? null, [user]);

    useEffect(() => {
        const fetchUserResearch = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const data = await getResearchByUserId(userId);
            setAllResearch(data);
            setDisplayedResearch(data.slice(0, ITEMS_PER_PAGE));
            setLoading(false);
        };
        fetchUserResearch();
    }, [userId]);

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
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                case "contenido":
                    return item.description?.toLowerCase().includes(lowerQuery) || false;
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

    const handleRefresh = () => {
        setSearchQuery("");
        setFilterType("");
        setDisplayedResearch(allResearch.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const resetResearchForm = () => {
        setTitle("");
        setDocument(null);
        setIsDraggingFile(false);
    };

    const isPdfFile = (file) => file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");

    const handleSelectedFile = (file) => {
        if (!file) return;

        if (!isPdfFile(file)) {
            toast.warning("Solo se permiten archivos PDF.");
            return;
        }

        setDocument(file);
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files?.[0];
        handleSelectedFile(file);
        event.target.value = "";
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDraggingFile) {
            setIsDraggingFile(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingFile(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingFile(false);

        const droppedFile = event.dataTransfer.files?.[0];
        handleSelectedFile(droppedFile);
    };

    const handleOpenModal = () => {
        if (!userId) {
            toast.warning("Debes iniciar sesión para agregar una investigación.");
            return;
        }
        setIsModalOpen(true);
    };

    const handleSubmitResearch = async (event) => {
        event.preventDefault();

        if (!userId) {
            toast.warning("No se encontró el ID del usuario.");
            return;
        }

        if (!title.trim()) {
            toast.warning("Ingresa un título para la investigación.");
            return;
        }

        if (!document) {
            toast.warning("Selecciona un archivo PDF.");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await createResearch({
                user_id: userId,
                title: title.trim(),
                document,
                access_token: accessToken,
            });

            if (!response.ok) {
                let errorMessage = "No se pudo crear la investigación.";

                try {
                    const data = await response.json();
                    errorMessage = data?.detail?.[0]?.msg || data?.detail || errorMessage;
                } catch {
                    // Ignore JSON parsing errors and keep default message.
                }

                toast.warning(errorMessage);
                return;
            }

            toast.success("Investigación creada correctamente.");
            setIsModalOpen(false);
            resetResearchForm();

            // Refresh the research list
            const updatedData = await getResearchByUserId(userId);
            setAllResearch(updatedData);
            setDisplayedResearch(updatedData.slice(0, ITEMS_PER_PAGE));
            setDisplayCount(ITEMS_PER_PAGE);
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión al crear la investigación.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <div className="flex gap-3 mb-5">
                <Button
                    className="bg-[#E7473C] hover:bg-[#831d16] text-white
                    hover:text-white hover:cursor-pointer rounded"
                    onClick={handleOpenModal}
                >
                    Agregar Investigación
                </Button>
                <Select value={filterType} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                        <SelectValue placeholder="Seleccionar Filtro" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="titulo">Titulo</SelectItem>
                            <SelectItem value="contenido">Contenido</SelectItem>
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
                    onClick={handleRefresh}
                    className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
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
                ) : displayedResearch.length > 0 ? (
                    displayedResearch.map((item) => (
                        <Link key={item.id} href={`/MisInvestigaciones/${item.id}`} className="grow">
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
                    <p>No hay investigaciones disponibles</p>
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

            <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) {
                        resetResearchForm();
                    }
                }}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Nueva investigación</DialogTitle>
                        <DialogDescription>
                            Completa el título y sube un documento PDF para crear la investigación.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmitResearch}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="researchTitle">Título</Label>
                            <Input
                                id="researchTitle"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Escribe el título de la investigación"
                                maxLength={255}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Documento PDF</Label>
                            <button
                                type="button"
                                className={`w-full rounded-lg border-2 border-dashed p-6 text-left transition-colors ${
                                    isDraggingFile
                                        ? "border-[#E7473C] bg-[#fff2f1]"
                                        : "border-gray-300 bg-gray-50 hover:border-[#E7473C]"
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[#E7473C]">
                                        <UploadCloudIcon size={24} />
                                    </span>
                                    <div>
                                        <p className="font-medium text-sm">
                                            Arrastra y suelta un PDF o haz clic para seleccionar
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Formato permitido: .pdf
                                        </p>
                                        {document && (
                                            <p className="text-xs text-[#831d16] mt-2">
                                                Archivo: {document.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>

                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                className="hidden"
                                onChange={handleFileInputChange}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetResearchForm();
                                }}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#E7473C] text-white hover:bg-[#831d16]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Guardando..." : "Crear investigación"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main>
    );
}