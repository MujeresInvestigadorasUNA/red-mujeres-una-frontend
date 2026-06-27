"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/app/contexts/UserContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { getResearch, getRecommendedResearch, likeResearch, unlikeResearch, getAuthorDisplay, getAuthorsData } from "@/lib/api/research";
import AuthorLinks from "@/app/components/AuthorLinks";
import { getResearchers } from "@/lib/api/forums";
import { getProfilePictureUrl } from "@/lib/api/auth";
import { Card } from "@/components/ui/card";
import { iconEye } from "@/app/assets/icons";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  FileText,
  ArrowRight,
  Sparkles,
  Users,
  CalendarDays,
  ScrollText,
  Network,
  Map,
  Box,
} from "lucide-react";

const COVER_GRADIENTS = [
  ["#831d16", "#c2372d"],
  ["#c2372d", "#E7473C"],
  ["#E7473C", "#FF6B55"],
  ["#831d16", "#E7473C"],
  ["#c2372d", "#FF6B55"],
  ["#E7473C", "#831d16"],
];

const RECOMMENDED_GRADIENTS = [
  ["#1e3a8a", "#2563eb"],
  ["#1d4ed8", "#3b82f6"],
  ["#2563eb", "#60a5fa"],
  ["#1e3a8a", "#3b82f6"],
  ["#1d4ed8", "#60a5fa"],
  ["#3b82f6", "#1e3a8a"],
];

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ResearchCard({ research, gradients, index, isRecommended = false, isLiked = false, likesCount = 0, onLike }) {
  const router = useRouter();
  const [from, to] =
    gradients[
      (String(research.id || "").charCodeAt(0) || 0) % gradients.length
    ];
  const initials = getInitials(research.author);

  const handleCardClick = (event) => {
    if (event.target.closest("a,button")) return;
    router.push(research.url);
  };

  const handleCardKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("a,button")) return;
    event.preventDefault();
    router.push(research.url);
  };

  return (
      <Card
        role="link"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className={`p-0 overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col flex-1 gap-0 cursor-pointer ${
          isRecommended
            ? "border-blue-100 hover:border-blue-300"
            : "border-slate-100 hover:border-[#E7473C]/30"
        }`}
        style={{ animationDelay: `${index * 70}ms`, animationFillMode: "both" }}
      >
        <div
          className="relative h-28 shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -left-3 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
          <FileText
            className="w-10 h-10 text-white/25 group-hover:text-white/35 transition-all duration-300 group-hover:scale-110"
            strokeWidth={1}
          />
          {isRecommended && (
            <span className="absolute top-2 left-2 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              IA
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {initials}
            </span>
            <AuthorLinks authors={research.authorsData} fallback={research.author} />
          </div>
          <h3
            className={`text-sm font-semibold text-slate-800 line-clamp-2 mb-1.5 leading-snug transition-colors duration-200 ${
              isRecommended
                ? "group-hover:text-blue-700"
                : "group-hover:text-[#831d16]"
            }`}
          >
            {research.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 flex-1 leading-relaxed">
            {research.description}
          </p>
          {isRecommended && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-blue-50 border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="text-[11px] text-blue-700 font-medium leading-tight">
                Según tus gustos, esto te puede gustar
                {research.similarity_score ? ` en un ${(research.similarity_score * 100).toFixed(0)}%` : ""}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2.5 mt-2.5 border-t border-slate-100">
            <button
              onClick={(e) => { e.preventDefault(); onLike && onLike(research.id); }}
              className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-3 h-3 ${isLiked ? "fill-current text-red-500" : ""}`} />
              <span className="text-xs">{likesCount}</span>
            </button>
            <div className="flex items-center gap-1 text-slate-400">
              {iconEye({ size: 12 })}
              <span className="text-xs">{research.visits_count || 0}</span>
            </div>
          </div>
        </div>
      </Card>
  );
}

function ResearchSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <Card
          key={i}
          className="p-0 overflow-hidden border border-slate-100 shadow-sm flex flex-col gap-0"
        >
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/4 mt-1" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function RecommendedLoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 py-2">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full bg-blue-300 animate-ping opacity-25" />
        </div>
        <p className="text-sm text-slate-500 animate-pulse">
          Analizando tus interacciones con IA...
        </p>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="p-0 overflow-hidden border border-blue-100 shadow-sm flex flex-col gap-0 shrink-0 w-64"
          >
            <Skeleton className="h-28 w-full rounded-none bg-blue-50" />
            <div className="p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-full bg-blue-50" />
                <Skeleton className="h-3 w-24 bg-blue-50" />
              </div>
              <Skeleton className="h-4 w-full bg-blue-50" />
              <Skeleton className="h-4 w-4/5 bg-blue-50" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useUser();
  const [allResearchCards, setAllResearchCards] = useState([]);
  const [recommendedCards, setRecommendedCards] = useState([]);
  const [forumCards, setForumCards] = useState([]);
  const [loadingAllResearch, setLoadingAllResearch] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [loadingForums, setLoadingForums] = useState(true);
  const [likedResearch, setLikedResearch] = useState(new Set());
  const [likesCounts, setLikesCounts] = useState({});

  const handleLike = async (researchId) => {
    if (!user) { toast.error("Debes iniciar sesión para dar like"); return; }
    const isLiked = likedResearch.has(researchId);
    const prev = likesCounts[researchId] || 0;

    setLikedResearch((s) => {
      const n = new Set(s);
      isLiked ? n.delete(researchId) : n.add(researchId);
      return n;
    });
    setLikesCounts((c) => ({ ...c, [researchId]: isLiked ? prev - 1 : prev + 1 }));

    try {
      const res = isLiked
        ? await unlikeResearch(user.id, researchId)
        : await likeResearch(user.id, researchId);
      if (!res?.success) throw new Error();
    } catch {
      setLikedResearch((s) => {
        const n = new Set(s);
        isLiked ? n.add(researchId) : n.delete(researchId);
        return n;
      });
      setLikesCounts((c) => ({ ...c, [researchId]: prev }));
      toast.error("Error al procesar el like");
    }
  };

  useEffect(() => {
    const fetchAllResearch = async () => {
      try {
        const data = await getResearch(6, user?.id || null);
        const initialCounts = {};
        const initialLiked = new Set();
        data.forEach((r) => {
          initialCounts[r.id] = parseInt(r.likes_count) || 0;
          if (r.is_liked === true || r.is_liked === "true") initialLiked.add(r.id);
        });
        setLikesCounts((c) => ({ ...initialCounts, ...c }));
        setLikedResearch((s) => new Set([...initialLiked, ...s]));
        setAllResearchCards(
          data.map((r) => ({
            id: r.id,
            title: r.title,
            author: getAuthorDisplay(r),
            authorsData: getAuthorsData(r),
            description: r.description || "Sin descripción disponible",
            url: `/Investigaciones/${r.id}`,
            visits_count: r.visits_count || 0,
            similarity_score: r.similarity_score,
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAllResearch(false);
      }
    };
    fetchAllResearch();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setRecommendedCards([]);
      setLoadingRecommended(false);
      return;
    }
    const fetchRecommended = async () => {
      setLoadingRecommended(true);
      try {
        const data = await getRecommendedResearch(user.id, 6);
        const initialCounts = {};
        const initialLiked = new Set();
        data.forEach((r) => {
          initialCounts[r.id] = parseInt(r.likes_count) || 0;
          if (r.is_liked === true || r.is_liked === "true") initialLiked.add(r.id);
        });
        setLikesCounts((c) => ({ ...c, ...initialCounts }));
        setLikedResearch((s) => {
          const n = new Set(s);
          initialLiked.forEach((id) => n.add(id));
          return n;
        });
        setRecommendedCards(
          data.map((r) => ({
            id: r.id,
            title: r.title,
            author: getAuthorDisplay(r),
            authorsData: getAuthorsData(r),
            description: r.description || "Sin descripción disponible",
            url: `/Investigaciones/${r.id}`,
            similarity_score: r.similarity_score,
            visits_count: r.visits_count || 0,
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingRecommended(false);
      }
    };
    fetchRecommended();
  }, [user?.id]);

  useEffect(() => {
    const fetchForumsData = async () => {
      try {
        const data = await getResearchers();

        // Obtener URLs firmadas para las fotos en paralelo
        const signedPhotos = await Promise.all(
          data.map(async (r) => {
            if (!r.photo) return null;
            try {
              const res = await getProfilePictureUrl({ user_id: r.id });
              if (!res.ok) return null;
              const d = await res.json();
              return d?.url || d?.signed_url || d || null;
            } catch {
              return null;
            }
          })
        );

        setForumCards(
          data.map((r, i) => ({
            id: r.id,
            photo: signedPhotos[i],
            title: `${r.first_name} ${r.last_name}`,
            url: `/Foros/${r.id}`,
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingForums(false);
      }
    };
    fetchForumsData();
  }, []);

  return (
    <main className="grow h-full">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[#E7473C] px-6 md:px-16 xl:px-20 py-5 text-[#F0F0F0] mainSection">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold leading-tight">
              Red de Mujeres Académicas UNA
            </h1>
            <p className="mt-1 text-xs text-white/80 max-w-lg">
              Plataforma para visibilizar logros, compartir conocimiento y
              conectar con la comunidad académica — potenciada con IA.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/Investigaciones"
              className="text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Investigaciones
            </Link>
            <Link
              href="/Foros"
              className="text-xs bg-[#831d16] hover:bg-[#6f1913] text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Foros
            </Link>
          </div>
        </div>
      </section>

      {/* ── Foros de Investigadoras ───────────────────────────────── */}
      <section className="bg-[#E7473C] px-6 md:px-16 xl:px-20 py-5 text-[#F0F0F0] mainSection">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Foros de Investigadoras
          </h2>
          <Link
            href="/Foros"
            className="text-xs font-medium text-white/80 hover:text-white flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loadingForums ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-20">
                <Skeleton className="w-14 h-14 rounded-full bg-white/20" />
                <Skeleton className="h-3 w-16 bg-white/20" />
                <Skeleton className="h-3 w-12 bg-white/20" />
              </div>
            ))}
          </div>
        ) : forumCards.length > 0 ? (
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2 px-4">
              {forumCards.map((forum, i) => (
                <CarouselItem key={i} className="pl-2 basis-auto">
                  <Link
                    href={forum.url}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/15 transition-colors w-19 group"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-white/30 group-hover:ring-white/70 transition-all duration-200 bg-white/20 flex items-center justify-center">
                      {forum.photo ? (
                        <img
                          src={forum.photo}
                          alt={forum.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-base text-white">
                          {getInitials(forum.title)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/90 font-medium text-center line-clamp-2 leading-tight group-hover:text-white transition-colors">
                      {forum.title}
                    </span>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hover:cursor-pointer -left-4 border-white/30 bg-white/15 text-white shadow-sm hover:bg-white/25 h-7 w-7" />
            <CarouselNext className="hover:cursor-pointer -right-4 border-white/30 bg-white/15 text-white shadow-sm hover:bg-white/25 h-7 w-7" />
          </Carousel>
        ) : (
          <p className="text-white/80 text-xs py-3">
            No hay foros disponibles en este momento.
          </p>
        )}
      </section>

      {/* ── Recomendadas Para Ti (solo usuarios logueados) ────────── */}
      {user?.id && (
        <section className="px-6 md:px-16 xl:px-20 py-8 bg-linear-to-br from-blue-50 to-indigo-50/60 border-b border-blue-100">
          <div className="flex items-end justify-between mb-5">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-blue-100 rounded-lg shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Recomendadas Para Ti
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seleccionadas por IA según tus visitas e interacciones.
                </p>
              </div>
            </div>
            <Link
              href="/Investigaciones"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 font-medium transition-colors"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loadingRecommended ? (
            <RecommendedLoadingState />
          ) : recommendedCards.length > 0 ? (
            <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
              <CarouselContent className="-ml-3">
                {recommendedCards.map((research, i) => (
                  <CarouselItem key={research.id} className="pl-3 basis-70 sm:basis-75 flex flex-col">
                    <ResearchCard
                      research={research}
                      gradients={RECOMMENDED_GRADIENTS}
                      index={i}
                      isRecommended
                      isLiked={likedResearch.has(research.id)}
                      likesCount={likesCounts[research.id] ?? 0}
                      onLike={handleLike}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hover:cursor-pointer -left-4 border-blue-200 bg-white text-blue-600 shadow-sm hover:bg-blue-50 h-7 w-7" />
              <CarouselNext className="hover:cursor-pointer -right-4 border-blue-200 bg-white text-blue-600 shadow-sm hover:bg-blue-50 h-7 w-7" />
            </Carousel>
          ) : (
            <div className="flex items-center gap-4 py-6">
              <div className="p-3 bg-blue-100 rounded-full shrink-0">
                <Sparkles className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Sin recomendaciones aún
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explora investigaciones para que la IA aprenda tus intereses.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Investigaciones Recientes ─────────────────────────────── */}
      <section className="px-6 md:px-16 xl:px-20 py-8 toolsSection">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Investigaciones Recientes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explora las investigaciones más recientes de la Red.
            </p>
          </div>
          <Link
            href="/Investigaciones"
            className="text-xs text-[#E7473C] hover:text-[#831d16] flex items-center gap-1 shrink-0 font-medium transition-colors"
          >
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loadingAllResearch ? (
          <ResearchSkeletonGrid count={6} />
        ) : allResearchCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allResearchCards.map((research, i) => (
              <ResearchCard
                key={research.id}
                research={research}
                gradients={COVER_GRADIENTS}
                index={i}
                isLiked={likedResearch.has(research.id)}
                likesCount={likesCounts[research.id] ?? 0}
                onLike={handleLike}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-xs">
              <div className="p-3 bg-slate-100 rounded-full inline-flex mb-3">
                <FileText className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                No hay investigaciones disponibles
              </h3>
              <p className="text-slate-500 text-xs">
                Las investigaciones aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Herramientas de la Red ────────────────────────────────── */}
      <section className="px-6 md:px-16 xl:px-20 py-8 bg-linear-to-br from-blue-50 to-indigo-50/60">
        <h2 className="text-[#E7473C] text-base font-bold mb-4">
          Herramientas de la Red
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              icon: Users,
              title: "Foros",
              desc: "Conoce a las investigadoras de la Red.",
              url: "/Foros",
              from: "#831d16",
              to: "#E7473C",
            },
            {
              icon: CalendarDays,
              title: "Eventos",
              desc: "Eventos para mujeres académicas.",
              url: "/Eventos",
              from: "#92400e",
              to: "#f59e0b",
            },
            {
              icon: ScrollText,
              title: "Investigaciones",
              desc: "Colección completa de investigaciones.",
              url: "/Investigaciones",
              from: "#065f46",
              to: "#10b981",
            },
            {
              icon: Network,
              title: "Grafo IA",
              desc: "Visualiza conexiones y recomendaciones.",
              url: "/GrafoRecomendaciones",
              from: "#4c1d95",
              to: "#8b5cf6",
            },
            {
              icon: Map,
              title: "Mapa 2D",
              desc: "Distribución semántica de investigaciones.",
              url: "/MapaDispersion",
              from: "#1e3a8a",
              to: "#3b82f6",
            },
            {
              icon: Box,
              title: "Mapa 3D",
              desc: "Espacio semántico en tres dimensiones.",
              url: "/MapaDispersion3D",
              from: "#0e7490",
              to: "#06b6d4",
            },
          ].map(({ icon: Icon, title, desc, url, from, to }) => (
            <Link key={url} href={url} className="block group">
              <Card className="p-0 overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full gap-0 hover:border-transparent">
                <div
                  className="relative h-20 shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
                  <div className="absolute -left-2 -bottom-3 w-12 h-12 rounded-full bg-white/10" />
                  <Icon
                    className="w-8 h-8 text-white/75 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-xs font-semibold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                    {title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed flex-1 line-clamp-2">
                    {desc}
                  </p>
                  <div
                    className="flex items-center gap-0.5 mt-2 text-[10px] font-medium"
                    style={{ color: from }}
                  >
                    Explorar <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
