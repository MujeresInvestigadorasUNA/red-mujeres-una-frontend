"use client";
import { useUser } from "@/app/contexts/UserContext";
import { Heart, Share2, FileText, Search, RefreshCw, MoreVertical, BookOpen, EyeOff, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea";
import { iconEye, iconHeart } from "@/app/assets/icons";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { UploadCloudIcon } from "lucide-react";
import { createResearch, getResearchByUserId, getAuthorDisplay, getAuthorsData } from "@/lib/api/research";
import AuthorLinks from "@/app/components/AuthorLinks";
import CoAuthorSelector from "@/app/components/CoAuthorSelector";
import { upsertNotification } from "@/lib/notifications";

const COVER_GRADIENTS = [
    ["#831d16", "#c2372d"],
    ["#c2372d", "#E7473C"],
    ["#E7473C", "#FF6B55"],
    ["#831d16", "#E7473C"],
    ["#c2372d", "#FF6B55"],
    ["#E7473C", "#831d16"],
];

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function MisInvestigaciones() {
    const { user, accessToken } = useUser();
    const fileInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [document, setDocument] = useState(null);
    const [allResearch, setAllResearch] = useState([]);
    const [displayedResearch, setDisplayedResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(6);
    const [searchQuery, setSearchQuery] = useState("");
    const [isProcessingMessageOpen, setIsProcessingMessageOpen] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("");
    const [selectedCoAuthors, setSelectedCoAuthors] = useState([]);
    const ITEMS_PER_PAGE = 6;

    const userId = useMemo(() => user?.id ?? user?.user_id ?? null, [user]);
    const canCreateResearch = useMemo(() => {
        const roleId = Number(user?.user_type_id ?? user?.user_type ?? user?.role_id ?? 0);
        return Boolean(user?.is_admin || roleId === 2 || roleId === 3);
    }, [user]);

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

        return research.filter((item) =>
            item.title?.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery)
        );
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleClear = () => {
        setSearchQuery("");
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const handleRefresh = () => {
        setSearchQuery("");
        setDisplayedResearch(allResearch.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
    };

    const resetResearchForm = () => {
        setTitle("");
        setDescription("");
        setDocument(null);
        setIsDraggingFile(false);
        setSelectedCoAuthors([]);
    };

    const handleAddCoAuthor = (author) => {
        setSelectedCoAuthors((prev) => [...prev, author]);
    };

    const handleRemoveCoAuthor = (authorId) => {
        setSelectedCoAuthors((prev) => prev.filter((a) => a.id !== authorId));
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

        if (!canCreateResearch) {
            toast.warning("Solo los investigadores y administradores pueden agregar investigaciones.");
            return;
        }

        setIsModalOpen(true);
    };

    const q = searchQuery.toLowerCase().trim();
    const filtered = allResearch.filter(
        (item) =>
            !q ||
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
    );
    const displayed = filtered.slice(0, displayCount);
    const hasMore = filtered.length > displayCount;

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
                description: description.trim(),
                document,
                access_token: accessToken,
                author_ids: selectedCoAuthors.map((a) => a.id),
            });

            let responseData = null;
            try {
                responseData = await response.json();
            } catch {
                responseData = null;
            }

            if (!response.ok) {
                let errorMessage = "No se pudo crear la investigación.";

                errorMessage = responseData?.detail?.[0]?.msg || responseData?.detail || errorMessage;

                toast.warning(errorMessage);
                return;
            }

            const normalizedStatus = String(responseData?.status || "").toLowerCase();
            const researchId = responseData?.id || responseData?.research_id || responseData?.research?.id || Date.now();

            if (normalizedStatus === "processing") {
                upsertNotification({
                    id: `research-${researchId}`,
                    type: "research",
                    researchId,
                    title: title.trim(),
                    status: "processing",
                    message: `La investigación \"${title.trim()}\" se está procesando.`,
                    read: false,
                });

                setProcessingMessage(
                    "Tu investigación se está subiendo y procesando en segundo plano. Puedes revisar su estado desde el ícono de notificaciones."
                );
                setIsProcessingMessageOpen(true);
                toast.success("Investigación enviada para procesamiento.");
            } else {
                toast.success("Investigación creada correctamente.");
            }

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
        <main className="min-h-screen bg-slate-50">
            {/* ── Header ─────────────────────────────────────────── */}
            <section
                className="px-6 md:px-16 xl:px-20 py-8"
                style={{ background: "linear-gradient(135deg, #831d16, #E7473C)" }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-white/80" />
                    <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                        Panel Personal
                    </span>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Mis Investigaciones</h1>
                        <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
                            Gestiona y comparte tus investigaciones con la comunidad de la Red de Mujeres Académicas UNA.
                        </p>
                    </div>

                    {canCreateResearch && (
                        <Button
                            onClick={handleOpenModal}
                            className="bg-white/15 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Añadir investigación
                        </Button>
                    )}
                </div>
            </section>

            {/* ── Content ───────────────────────────────────────── */}
            <section className="px-6 md:px-16 xl:px-20 py-8 max-w-7xl mx-auto">
            {/* Search & Filter bar */}
            <div className="flex gap-2 mb-5 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                        placeholder="Buscar investigaciones..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-9 h-9 text-sm bg-white border-slate-200"
                    />
                </div>
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="h-9 w-9 text-slate-400 hover:text-slate-600"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            {!loading && (
                <p className="text-xs text-slate-400 mb-5">
                    {filtered.length} investigación{filtered.length !== 1 ? "es" : ""}
                    {searchQuery && ` para "${searchQuery}"`}
                </p>
            )}
            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
                {loading ? (
                    [...Array(9)].map((_, i) => (
                        <Card key={i} className="p-0 overflow-hidden border border-slate-100 shadow-sm flex flex-col gap-0">
                            <Skeleton className="h-36 w-full rounded-none" />
                            <div className="p-4 flex flex-col gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-3 w-full mt-1" />
                                <Skeleton className="h-3 w-4/5" />
                                <Skeleton className="h-3 w-3/4" />
                                <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
                                    <div className="flex gap-3">
                                        <Skeleton className="h-3 w-10" />
                                        <Skeleton className="h-3 w-10" />
                                    </div>
                                    <Skeleton className="h-3 w-4" />
                                </div>
                            </div>
                        </Card>
                    ))
                ) : displayed.length > 0 ? (
                    displayed.map((item) => {
                        const [from, to] = COVER_GRADIENTS[(String(item.id || "").charCodeAt(0) || 0) % COVER_GRADIENTS.length];
                        const authorsData = getAuthorsData(item);
                        const authorName = getAuthorDisplay(item);
                        const initials = getInitials(authorName);

                        return (
                            <Link key={item.id} href={`/MisInvestigaciones/${item.id}`} className="block group">
                                <Card className="p-0 overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:border-[#E7473C]/30 transition-all duration-300 flex flex-col h-full gap-0">

                                    {/* Cover */}
                                    <div
                                        className="relative h-36 shrink-0 flex items-center justify-center overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                                    >
                                        {/* Decorative circles */}
                                        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
                                        <div className="absolute -left-4 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
                                        <div className="absolute right-8 bottom-4 w-10 h-10 rounded-full bg-white/8" />

                                        {/* Doc icon */}
                                        <FileText
                                            className="w-14 h-14 text-white/25 group-hover:text-white/35 transition-all duration-300 group-hover:scale-110"
                                            strokeWidth={1}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-4">
                                        {/* Author */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                                            >
                                                {initials}
                                            </span>
                                            <AuthorLinks authors={authorsData} fallback={authorName} />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 leading-snug group-hover:text-[#831d16] transition-colors duration-200">
                                            {item.title || "Sin título"}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-slate-500 line-clamp-3 flex-1 leading-relaxed">
                                            {item.description || "Sin descripción disponible."}
                                        </p>

                                        {/* Stats footer */}
                                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                                            <div className="flex gap-3">
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Heart className="w-3.5 h-3.5" />
                                                    <span className="text-xs">{item.likes_count || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    {iconEye({ size: 14 })}
                                                    <span className="text-xs">{item.visits_count || 0}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); }}
                                                className="text-slate-400 hover:text-[#E7473C] transition-colors"
                                                title="Compartir"
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-full flex items-center justify-center py-24">
                        <div className="text-center max-w-sm">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-slate-100 rounded-full">
                                    <FileText className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-slate-700 mb-1">
                                No hay investigaciones disponibles
                            </h3>
                            <p className="text-slate-500 text-sm">
                                No encontramos resultados con los criterios de búsqueda. Intenta con otros términos.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {displayCount < allResearch.length && !loading && (
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={() => setDisplayCount((c) => c + ITEMS_PER_PAGE)}
                        variant="outline"
                        className="border-slate-200 text-slate-600 hover:border-[#E7473C] hover:text-[#E7473C] transition-colors w-full"
                    >
                        Cargar más · {filtered.length - displayCount} restantes
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
                            Completa el título, agrega una descripción y sube un documento PDF para crear la investigación.
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
                            <Label htmlFor="researchDescription">Descripción</Label>
                            <Textarea
                                id="researchDescription"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Describe brevemente la investigación"
                                maxLength={2000}
                                className="min-h-[140px] resize-y"
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

                        <CoAuthorSelector
                            selectedAuthors={selectedCoAuthors}
                            onAdd={handleAddCoAuthor}
                            onRemove={handleRemoveCoAuthor}
                            excludeUserId={userId}
                        />

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

            <Dialog
                open={isProcessingMessageOpen}
                onOpenChange={setIsProcessingMessageOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Investigación en procesamiento</DialogTitle>
                        <DialogDescription>
                            {processingMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setIsProcessingMessageOpen(false)}
                            className="bg-[#E7473C] text-white hover:bg-[#831d16]"
                        >
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </section>
        </main>
    );
}