"use client";

import { Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/app/contexts/UserContext";
import { getResearchById, getResearchPdfUrl, registerResearchVisit, updateResearch, getResearchAuthors, addResearchAuthors, removeResearchAuthors } from "@/lib/api/research";
import CoAuthorSelector from "@/app/components/CoAuthorSelector";

const PLACEHOLDER_DESCRIPTION = "Exploración detallada de esta investigación académica de la Red de Mujeres Académicas.";

export default function Investigacion() {
    const params = useParams();
    const researchId = useMemo(() => params.investigacion, [params.investigacion]);
    const { user } = useUser();

    const [currentResearch, setCurrentResearch] = useState(null);
    const [pdfLinks, setPdfLinks] = useState({ inlineUrl: null, downloadUrl: null });
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [coAuthors, setCoAuthors] = useState([]);
    const [coAuthorsLoading, setCoAuthorsLoading] = useState(false);
    const refreshTimeoutRef = useRef(null);
    const refreshBufferMs = 3 * 60 * 1000;
    const fallbackRefreshMs = 25 * 60 * 1000;
    const viewerUrl = pdfLinks.inlineUrl;
    const downloadUrl = pdfLinks.downloadUrl;

    useEffect(() => {
        const fetchResearch = async () => {
            if (!researchId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const research = await getResearchById(researchId);
                setCurrentResearch(research);
                setTitle(research?.title || "");
                setDescription(research?.description || "");
            } catch (error) {
                console.error("Error fetching research:", error);
                toast.error("No se pudo cargar la investigación.");
            } finally {
                setLoading(false);
            }
        };

        setPdfLinks({ inlineUrl: null, downloadUrl: null });
        fetchResearch();
    }, [researchId]);

    useEffect(() => {
        let isMounted = true;

        const clearRefreshTimeout = () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }
        };

        const scheduleRefresh = (expiresAt, refreshFn) => {
            clearRefreshTimeout();
            if (!expiresAt) {
                refreshTimeoutRef.current = setTimeout(refreshFn, fallbackRefreshMs);
                return;
            }

            const expiresMs = new Date(expiresAt).getTime();
            if (!Number.isFinite(expiresMs)) {
                refreshTimeoutRef.current = setTimeout(refreshFn, fallbackRefreshMs);
                return;
            }

            const delayMs = Math.max(expiresMs - Date.now() - refreshBufferMs, 1000);
            refreshTimeoutRef.current = setTimeout(refreshFn, delayMs);
        };

        const refreshPdfUrl = async () => {
            if (!researchId || !currentResearch?.research_link) {
                return;
            }

            const result = await getResearchPdfUrl(researchId);
            if (!isMounted) {
                return;
            }

            if (result?.inlineUrl || result?.downloadUrl) {
                setPdfLinks({
                    inlineUrl: result.inlineUrl || null,
                    downloadUrl: result.downloadUrl || result.inlineUrl || null,
                });
            } else {
                setPdfLinks({ inlineUrl: null, downloadUrl: null });
            }

            scheduleRefresh(result?.expiresAt, refreshPdfUrl);
        };

        if (!researchId || !currentResearch?.research_link) {
            clearRefreshTimeout();
            setPdfLinks({ inlineUrl: null, downloadUrl: null });
            return undefined;
        }

        refreshPdfUrl();

        return () => {
            isMounted = false;
            clearRefreshTimeout();
        };
    }, [researchId, currentResearch?.research_link]);


    useEffect(() => {
        if (!researchId || !user?.id) {
            return;
        }

        registerResearchVisit(user.id, researchId);
    }, [researchId, user?.id]);

    useEffect(() => {
        if (!researchId) return;

        const loadCoAuthors = async () => {
            setCoAuthorsLoading(true);
            try {
                const data = await getResearchAuthors(researchId);
                setCoAuthors(Array.isArray(data) ? data.filter((a) => a.id !== user?.id) : []);
            } finally {
                setCoAuthorsLoading(false);
            }
        };

        loadCoAuthors();
    }, [researchId, user?.id]);

    const handleAddCoAuthor = async (author) => {
        const res = await addResearchAuthors(researchId, [author.id]);
        if (res.ok) {
            setCoAuthors((prev) => [...prev, author]);
            toast.success(`${author.first_name} ${author.last_name} agregada como co-autora.`);
        } else {
            toast.error("No se pudo agregar la co-autora.");
        }
    };

    const handleRemoveCoAuthor = async (authorId) => {
        const res = await removeResearchAuthors(researchId, [authorId]);
        if (res.ok) {
            setCoAuthors((prev) => prev.filter((a) => a.id !== authorId));
            toast.success("Co-autora eliminada.");
        } else {
            toast.error("No se pudo eliminar la co-autora.");
        }
    };

    const handleCancelEdit = () => {
        setTitle(currentResearch?.title || "");
        setDescription(currentResearch?.description || "");
        setIsEditing(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!researchId) {
            toast.error("No se encontró el ID de la investigación.");
            return;
        }

        if (!title.trim()) {
            toast.warning("El título no puede estar vacío.");
            return;
        }

        try {
            setSaving(true);
            const response = await updateResearch({
                research_id: researchId,
                title: title.trim(),
                description: description.trim(),
            });

            let responseData = null;
            try {
                responseData = await response.json();
            } catch {
                responseData = null;
            }

            if (!response.ok) {
                const errorMessage = responseData?.detail?.[0]?.msg || responseData?.detail || "No se pudo actualizar la investigación.";
                toast.error(errorMessage);
                return;
            }

            toast.success("Investigación actualizada correctamente.");

            const updatedResearch = await getResearchById(researchId);
            setCurrentResearch(updatedResearch);
            setTitle(updatedResearch?.title || "");
            setDescription(updatedResearch?.description || "");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating research:", error);
            toast.error("Error de conexión al actualizar la investigación.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-[600px] w-full rounded-lg" />
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                </div>
            ) : currentResearch ? (
                <div className="space-y-8">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold">{currentResearch.title}</h1>
                        <Button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-[#E7473C] hover:bg-[#831d16] text-white gap-2"
                        >
                            <Pencil size={16} />
                            Editar
                        </Button>
                    </div>

                    <p className="text-gray-700">
                        {currentResearch.description || PLACEHOLDER_DESCRIPTION}
                    </p>

                    {coAuthors.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700">Co-autoras</span>
                            <div className="flex flex-wrap gap-2">
                                {coAuthors.map((author) => (
                                    <span
                                        key={author.id}
                                        className="inline-flex items-center bg-red-50 border border-red-200 text-red-800 rounded-full px-3 py-1 text-sm"
                                    >
                                        {author.first_name} {author.last_name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <Dialog
                        open={isEditing}
                        onOpenChange={(open) => {
                            if (!open) handleCancelEdit();
                        }}
                    >
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Editar investigación</DialogTitle>
                                <DialogDescription>
                                    Modifica el título, la descripción y gestiona las co-autoras.
                                </DialogDescription>
                            </DialogHeader>

                            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="Título de la investigación"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="Descripción de la investigación"
                                        className="min-h-[140px] resize-y"
                                    />
                                </div>

                                <CoAuthorSelector
                                    selectedAuthors={coAuthors}
                                    onAdd={handleAddCoAuthor}
                                    onRemove={handleRemoveCoAuthor}
                                    excludeUserId={user?.id}
                                />
                                {coAuthorsLoading && (
                                    <p className="text-xs text-gray-400">Cargando co-autoras...</p>
                                )}

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-[#E7473C] text-white hover:bg-[#831d16]"
                                    >
                                        {saving ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="text-2xl font-bold">Documento de investigación</h2>
                            {downloadUrl ? (
                                <Button asChild className="bg-[#E7473C] hover:bg-[#831d16] text-white">
                                    <a href={downloadUrl} download>
                                        Descargar PDF
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                        {viewerUrl ? (
                            <iframe
                                src={viewerUrl}
                                title={`${currentResearch.title} - PDF de investigación`}
                                className="w-full h-[90vh] rounded-lg border border-gray-200 bg-white"
                            />
                        ) : currentResearch.research_link ? (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-600 space-y-3">
                                <p className="font-medium text-gray-700">
                                    No se pudo obtener un enlace seguro para este documento.
                                </p>
                                <p className="text-sm">
                                    Reintenta en unos minutos o recarga la pagina.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500">
                                No hay un PDF disponible para esta investigación.
                            </div>
                        )}
                    </section>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p>Investigación no encontrada</p>
                </div>
            )}
        </main>
    );
}
