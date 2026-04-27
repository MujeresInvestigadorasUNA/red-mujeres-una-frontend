"use client";
import { useUser } from "@/app/contexts/UserContext";
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
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
import { useMemo, useRef, useState } from "react";
import { UploadCloudIcon } from "lucide-react";
import { createResearch } from "@/lib/api/research";
import { toast } from "sonner";

export default function MisInvestigaciones() {
    const { user, accessToken } = useUser();
    const fileInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [document, setDocument] = useState(null);

    const userId = useMemo(() => user?.id ?? user?.user_id ?? null, [user]);

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