"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/app/contexts/UserContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CustomCard from "./components/CustomCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getResearch, getRecommendedResearch } from "@/lib/api/research";
import { getCourses } from "@/lib/api/courses";
import { getResearchers } from "@/lib/api/forums";
import { Card } from "@/components/ui/card";
import { iconEye, iconHeart } from "@/app/assets/icons";

const truncateDescription = (text, limit = 60) => {
    if (!text) return "Sin descripción disponible";
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
};

const RESEARCH_PLACEHOLDER_IMAGES = [
  "/images/curso1.png",
  "/images/curso2.png",
  "/images/curso3.png",
];

const COURSE_PLACEHOLDER_IMAGE = "/images/curso1.png";
const FORUM_PLACEHOLDER_IMAGE = "/images/curso1.png";

const RESEARCH_PLACEHOLDER_DESCRIPTION = "Explora esta investigación destacada y accede a recursos académicos de calidad.";

export default function Home() {
  const { user } = useUser();
  const [researchCards, setResearchCards] = useState([]);
  const [courseCards, setCourseCards] = useState([]);
  const [forumCards, setForumCards] = useState([]);
  const [loadingResearch, setLoadingResearch] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingForums, setLoadingForums] = useState(true);

  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        let data;
        
        // If user is logged in, get personalized recommendations
        if (user?.id) {
          data = await getRecommendedResearch(user.id, 4);
        } else {
          // Otherwise, get general research
          data = await getResearch(4, null);
        }
        
        // Transform API response to card format
        const transformedCards = data.map((research, index) => ({
          id: research.id,
          title: research.title,
          author: research.author || research.user_name || "Investigador",
          description: research.description || "Sin descripción disponible",
          url: `/Investigaciones/${research.id}`,
          similarity_score: research.similarity_score,
        }));
        
        setResearchCards(transformedCards);
      } catch (error) {
        console.error("Failed to fetch research:", error);
      } finally {
        setLoadingResearch(false);
      }
    };

    fetchResearchData();
  }, [user?.id]);

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const data = await getCourses();
        
        // Transform API response to card format
        const transformedCards = data.map((course) => ({
          id: course.id,
          image: course.photo || COURSE_PLACEHOLDER_IMAGE,
          title: course.title,
          description: course.description || "Accede a este curso y mejora tus habilidades académicas.",
          url: `/Cursos/${course.id}`,
          bgColor: "#F0F0F0",
          titleTextColor: "#831d16",
          textColor: "#E7473C",
          withImage: false
        }));
        
        setCourseCards(transformedCards);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCoursesData();
  }, []);

  useEffect(() => {
    const fetchForumsData = async () => {
      try {
        const data = await getResearchers();
        
        // Transform API response to card format
        const transformedCards = data.map((researcher) => ({
          id: researcher.id,
          image: researcher.photo || FORUM_PLACEHOLDER_IMAGE,
          title: `${researcher.first_name} ${researcher.last_name}`,
          description: researcher.user_description || researcher.user_profession || "Investigadora destacada de la Red.",
          url: `/Foros/${researcher.id}`
        }));
        
        setForumCards(transformedCards);
      } catch (error) {
        console.error("Failed to fetch forums:", error);
      } finally {
        setLoadingForums(false);
      }
    };

    fetchForumsData();
  }, []);

  return (
    <main className="flex-grow h-[100%]">
      <section className="bg-[#E7473C] px-10 py-10 text-[#F0F0F0] min-h-[calc(100vh-80px)] mainSection">
        <h1 className="text-2xl font-bold px-10">
          Red de Mujeres Académicas UNA
        </h1>
        <p className="mt-3 px-10">
          Únete a la Red de Mujeres Académicas, una plataforma para visibilizar logros,
          compartir conocimientos y conectar con la comunidad. Publica cursos, participa
          en foros y accede a información clave con tecnología avanzada e inteligencia artificial.
        </p>
        <div className="mt-10 px-10">
          <h2 className="text-xl font-bold mt-10 mb-5">Foros Recomendados</h2>
          {loadingForums ? (
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {[...Array(4)].map((_, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                    <div className="p-4">
                      <Skeleton className="h-48 w-full rounded-lg mb-3" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hover:cursor-pointer border-[#F0F0F0] bg-[#831d16] text-[#F0F0F0] shadow-md hover:bg-[#6f1913]"/>
              <CarouselNext className="hover:cursor-pointer border-[#F0F0F0] bg-[#831d16] text-[#F0F0F0] shadow-md hover:bg-[#6f1913]"/>
            </Carousel>
          ) : forumCards.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {forumCards.map((forum, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                    <CustomCard
                      cardImage={forum.image}
                      cardTitle={forum.title}
                      cardDescription={forum.description}
                      cardURL={forum.url}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hover:cursor-pointer border-[#F0F0F0] bg-[#831d16] text-[#F0F0F0] shadow-md hover:bg-[#6f1913]"/>
              <CarouselNext className="hover:cursor-pointer border-[#F0F0F0] bg-[#831d16] text-[#F0F0F0] shadow-md hover:bg-[#6f1913]"/>
            </Carousel>
          ) : (
            <div className="w-full flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-[#831d16] rounded-full">
                    <svg
                      className="w-10 h-10 text-[#F0F0F0]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">
                  No hay foros disponibles
                </h3>
                <p className="text-gray-200 text-sm">
                  Los foros serán mostrados aquí cuando estén disponibles.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="px-20 py-10 toolsSection">
        <h2 className="text-[#E7473C] text-xl font-bold">Herramientas de la Red</h2>
        <div className="mt-4 flex flex-wrap gap-5">
          <div className="min-w-[260px] flex-1 basis-[280px]">
            <CustomCard
              cardImage="/images/tool1.png"
              cardTitle="Foros de discusión"
              cardDescription="Revisa los foros con toda la información de
              cada una de las mujeres de la Red."
              cardURL="/Foros"
              cardBgColor="#E7473C"
              cardTitleTextColor="#F0F0F0"
              cardTextColor="#F0F0F0"
            />
          </div>
          <div className="min-w-[260px] flex-1 basis-[280px]">
            <CustomCard
              cardImage="/images/tool2.png"
              cardTitle="Cursos en línea"
              cardDescription="Accede a una variedad de cursos en línea diseñados
              para empoderar a las mujeres académicas."
              cardURL="/Cursos"
              cardBgColor="#E7473C"
              cardTitleTextColor="#F0F0F0"
              cardTextColor="#F0F0F0"
            />
          </div>
          <div className="min-w-[260px] flex-1 basis-[280px]">
            <CustomCard
              cardImage="/images/tool3.png"
              cardTitle="Recursos de investigación"
              cardDescription="Explora una colección de recursos de investigación
              para apoyar tu trabajo académico."
              cardURL="/Investigaciones"
              cardBgColor="#E7473C"
              cardTitleTextColor="#F0F0F0"
              cardTextColor="#F0F0F0"
            />
          </div>
          <div className="min-w-[260px] flex-1 basis-[280px]">
            <CustomCard
              cardImage="/images/tool4.png"
              cardTitle="Grafo de recomendaciones"
              cardDescription="Visualiza las conexiones entre tus visitas, likes y recomendaciones."
              cardURL="/GrafoRecomendaciones"
              cardBgColor="#E7473C"
              cardTitleTextColor="#F0F0F0"
              cardTextColor="#F0F0F0"
            />
          </div>
        </div>
      </section>
      <section className="flex flex-wrap items-stretch gap-10 px-20 py-10 bg-[#b62116] text-[#F0F0F0] cursesSection">
        <div className="flex min-w-[280px] flex-1 basis-[320px] flex-col gap-2">
          <h2 className="text-xl font-bold mb-2">Cursos Recomendados</h2>
          {loadingCourses ? (
            <>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="p-3 rounded">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </>
          ) : courseCards.length > 0 ? (
            courseCards.map((course) => (
              <CustomCard
                key={course.id}
                cardTitle={course.title}
                cardDescription={course.description}
                cardURL={course.url}
                cardBgColor={course.bgColor}
                cardTitleTextColor={course.titleTextColor}
                cardTextColor={course.textColor}
                cardWithImage={course.withImage}
              />
            ))
          ) : (
            <div className="w-full flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-[#831d16] rounded-full">
                    <svg
                      className="w-10 h-10 text-[#F0F0F0]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v16a1 1 0 01-1.55.894L12 17.69l-4.45 3.104A1 1 0 016 20V4z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">
                  No hay cursos disponibles
                </h3>
                <p className="text-gray-200 text-sm">
                  Los cursos serán mostrados aquí cuando estén disponibles.
                </p>
              </div>
            </div>
          )}
          <Link
            href="/Cursos"
            className="bg-[#E7473C] text-white text-center px-4 py-2 rounded
            shadow"
          >
            Ver Todos
          </Link>
        </div>
        <div className="min-w-[280px] flex-1 basis-[420px] self-stretch rounded bg-white p-3 shadow-md">
          <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded">
            <Image
              src="/images/cursos.png"
              alt="Curso 1"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover bg-[#fff]"
            />
          </div>
        </div>
      </section>
      <section className="px-20 py-10 toolsSection">
        <h2 className="text-xl font-bold mb-5">
          {user?.id ? "Investigaciones Para Ti" : "Investigaciones Destacadas"}
        </h2>
        {loadingResearch ? (
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {[...Array(2)].map((_, index) => {
                return (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                    <div className="p-4">
                      <div className="bg-gray-200 p-6 rounded-lg flex-shrink-0">
                        <Skeleton className="h-6 w-3/4 mb-2 bg-gray-300" />
                        <Skeleton className="h-4 w-1/2 bg-gray-300" />
                      </div>
                      <div className="mt-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6 mb-2" />
                        <Skeleton className="h-4 w-4/5 mb-2" />
                        <div className="flex gap-4 pt-2">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hover:cursor-pointer"/>
            <CarouselNext className="hover:cursor-pointer"/>
          </Carousel>
        ) : researchCards.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {researchCards.map((research) => {
                const gradients = [
                  "bg-gradient-to-br from-[#831d16] to-[#c2372d]",
                  "bg-gradient-to-br from-[#E7473C] to-[#FF6B55]",
                  "bg-gradient-to-br from-[#c2372d] to-[#FF6B55]",
                  "bg-gradient-to-br from-[#831d16] to-[#E7473C]",
                  "bg-gradient-to-r from-[#E7473C] to-[#c2372d]",
                  "bg-gradient-to-r from-[#FF6B55] to-[#831d16]",
                ];
                const gradientIndex = (String(research.id || '').charCodeAt(0) || 0) % gradients.length;
                const gradient = gradients[gradientIndex];
                
                return (
                  <CarouselItem key={research.id} className="md:basis-1/2 lg:basis-1/2">
                    <Link href={research.url} className="block">
                      <Card
                        className="p-0 overflow-hidden rounded-lg border-none shadow
                        hover:shadow-lg hover:cursor-pointer transition-all duration-300
                        flex flex-col h-full gap-0"
                      >
                        {/* Gradient Header */}
                        <div className={`${gradient} p-6 text-white flex-shrink-0`}>
                          <h3 className="text-lg font-bold line-clamp-2 mb-2">
                            {research.title}
                          </h3>
                          <p className="text-sm opacity-90 line-clamp-1">
                            {research.author}
                          </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 flex flex-col">
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                            {truncateDescription(research.description)}
                          </p>
                          
                          {research.similarity_score && (
                            <p className="text-xs text-gray-500 mb-4">
                              Similitud: {(research.similarity_score * 100).toFixed(1)}%
                            </p>
                          )}

                          {/* Stats Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                {iconHeart({ size: 14 })}
                                <span className="text-xs">0</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                {iconEye({ size: 14 })}
                                <span className="text-xs">0</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hover:cursor-pointer"/>
            <CarouselNext className="hover:cursor-pointer"/>
          </Carousel>
        ) : (
          <div className="w-full flex items-center justify-center py-12">
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
                Las investigaciones serán mostradas aquí cuando estén disponibles.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
