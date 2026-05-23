"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/app/contexts/UserContext";
import { getResearchById, getResearchPdfUrl, registerResearchVisit, updateResearch } from "@/lib/api/research";

const PLACEHOLDER_IMAGES = [
    "/images/curso1.png",
    "/images/curso2.png",
    "/images/curso3.png",
];

const PLACEHOLDER_DESCRIPTION = "Exploración detallada de esta investigación académica de la Red de Mujeres Académicas.";

const isValidImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const urlLower = url.toLowerCase();
    return imageExtensions.some((ext) => urlLower.includes(ext));
};

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
        } catch (error) {
            console.error("Error updating research:", error);
            toast.error("Error de conexión al actualizar la investigación.");
        } finally {
            setSaving(false);
        }
    };

    const imageSrc = isValidImageUrl(currentResearch?.vector_link)
        ? currentResearch.vector_link
        : PLACEHOLDER_IMAGES[0];

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
                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold">Editar investigación</h1>
                        <p className="text-gray-700">
                            Modifica el título y la descripción. El documento PDF y la imagen se muestran como referencia.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Título de la investigación"
                            className="text-lg font-semibold"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Descripción de la investigación"
                            className="min-h-40 resize-none"
                        />
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">Vista previa de la investigación</h2>
                        <p className="text-gray-700">
                            {currentResearch.description || PLACEHOLDER_DESCRIPTION}
                        </p>
                    </section>

                    <section className="mt-8 space-y-4">
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

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-[#E7473C] text-white hover:bg-[#cf4035] hover:cursor-pointer w-full"
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="text-center py-10">
                    <p>Investigación no encontrada</p>
                </div>
            )}
        </main>
    );
}
