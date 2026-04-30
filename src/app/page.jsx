"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CustomCard from "./components/CustomCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getResearch } from "@/lib/api/research";
import { getCourses } from "@/lib/api/courses";
import { getResearchers } from "@/lib/api/forums";

const RESEARCH_PLACEHOLDER_IMAGES = [
  "/images/curso1.png",
  "/images/curso2.png",
  "/images/curso3.png",
];

const COURSE_PLACEHOLDER_IMAGE = "/images/curso1.png";
const FORUM_PLACEHOLDER_IMAGE = "/images/curso1.png";

const RESEARCH_PLACEHOLDER_DESCRIPTION = "Explora esta investigación destacada y accede a recursos académicos de calidad.";

export default function Home() {
  const [researchCards, setResearchCards] = useState([]);
  const [courseCards, setCourseCards] = useState([]);
  const [forumCards, setForumCards] = useState([]);
  const [loadingResearch, setLoadingResearch] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingForums, setLoadingForums] = useState(true);

  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        const data = await getResearch();
        
        // Transform API response to card format
        const transformedCards = data.map((research, index) => ({
          id: research.id,
          image: RESEARCH_PLACEHOLDER_IMAGES[index % RESEARCH_PLACEHOLDER_IMAGES.length],
          title: research.title,
          description: RESEARCH_PLACEHOLDER_DESCRIPTION,
          url: research.research_link || "/Investigaciones",
          bgColor: "#E7473C",
          titleTextColor: "#F0F0F0",
          textColor: "#F0F0F0",
          withImage: true
        }));
        
        setResearchCards(transformedCards);
      } catch (error) {
        console.error("Failed to fetch research:", error);
      } finally {
        setLoadingResearch(false);
      }
    };

    fetchResearchData();
  }, []);

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
            <p className="text-center text-gray-300">No hay foros disponibles.</p>
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
            <p className="text-center text-gray-200">No hay cursos disponibles.</p>
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
        <h2 className="text-xl font-bold mb-5">Investigaciones Recomendadas</h2>
        {loadingResearch ? (
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {[...Array(2)].map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-4">
                    <Skeleton className="h-48 w-full rounded-lg mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CarouselItem>
              ))}
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
              {researchCards.map((research, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <CustomCard
                    cardImage={research.image}
                    cardTitle={research.title}
                    cardDescription={research.description}
                    cardURL={research.url}
                    cardBgColor={research.bgColor}
                    cardTitleTextColor={research.titleTextColor}
                    cardTextColor={research.textColor}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hover:cursor-pointer"/>
            <CarouselNext className="hover:cursor-pointer"/>
          </Carousel>
        ) : (
          <p className="text-center text-gray-500">No hay investigaciones disponibles.</p>
        )}
      </section>
    </main>
  );
}
