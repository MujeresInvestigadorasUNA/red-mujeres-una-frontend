import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CustomCard from "./components/CustomCard";

const FORUMS_CARDS = [{
  id: 1,
  image: "/images/jinette.png",
  title: "Jinette Naranjo",
  description:
    "Jinette Naranjo es catedrática de Fisiología y doctora en Farmacia con una amplia trayectoria docente e investigadora.",
  url: "/Foros/jinette-naranjo"
}, {
  id: 2,
  image: "/images/kattia.png",
  title: "Kattia Vasconcelos",
  description:
    "Vasconcelos es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
  url: "/Foros/kattia-vasconcelos"
}, {
  id: 3,
  image: "/images/mildred.png",
  title: "Mildred Soto",
  description:
    "Bioeticista con amplia experiencia en ética de la investigación y la atención en salud.",
  url: "/Foros/mildred-soto"
}, {
  id: 4,
  image: "/images/anayudel.png",
  title: "Anayudel Gutierrez",
  description:
    "Investigadora del CIEM con un enfoque en estudios de género y políticas públicas.",
  url: "/Foros/anayudel-gutierrez"
}, {
  id: 5,
  image: "/images/brenda.png",
  title: "Brenda Jiménez",
  description:
    "Investigadora con experiencia en ciencias sociales y desarrollo comunitario.",
  url: "/Foros/brenda-jimenez"
}];

const RESEARCH_CARDS = [
  {
    id: 1,
    image: "/images/curso1.png",
    title: "Introducción a la Investigación Académica",
    description:
      "Un curso básico para entender los fundamentos de la investigación académica.",
    url: "/Cursos",
    bgColor: "#E7473C",
    titleTextColor: "#F0F0F0",
    textColor: "#F0F0F0",
    withImage: true
  },
  {
    id: 2,
    image: "/images/curso2.png",
    title: "Gestión del Tiempo para Académicas",
    description:
      "Aprende técnicas efectivas de gestión del tiempo para equilibrar tus responsabilidades académicas y personales.",
    url: "/Cursos",
    bgColor: "#E7473C",
    titleTextColor: "#F0F0F0",
    textColor: "#F0F0F0",
    withImage: true
  },
  {
    id: 3,
    image: "/images/curso3.png",
    title: "Redacción Académica",
    description:
      "Mejora tus habilidades de redacción académica y aprende a comunicar tus ideas de manera efectiva.",
    url: "/Cursos",
    bgColor: "#E7473C",
    titleTextColor: "#F0F0F0",
    textColor: "#F0F0F0",
    withImage: true
  },
];

export default function Home() {
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
          <h2 className="text-xl font-bold mt-10 mb-5">Foros Destacados</h2>
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {FORUMS_CARDS.map((forum, index) => (
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
            <CarouselPrevious className="hover:cursor-pointer"/>
            <CarouselNext className="hover:cursor-pointer"/>
          </Carousel>
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
          <h2 className="text-xl font-bold mb-2">Cursos Populares</h2>
          <CustomCard
            cardTitle="Introducción a la Investigación Académica"
            cardDescription="Un curso básico para entender los fundamentos de la investigación académica."
            cardURL="/Cursos"
            cardBgColor="#F0F0F0"
            cardTitleTextColor="#831d16"
            cardTextColor="#E7473C"
            cardWithImage={false}
          />
          <CustomCard
            cardTitle="Gestión del Tiempo para Académicas"
            cardDescription="Aprende técnicas efectivas de gestión del tiempo para equilibrar tus responsabilidades académicas y personales."
            cardURL="/Cursos"
            cardBgColor="#F0F0F0"
            cardTitleTextColor="#831d16"
            cardTextColor="#E7473C"
            cardWithImage={false}
          />
          <CustomCard
            cardTitle="Redacción Académica"
            cardDescription="Mejora tus habilidades de redacción académica con este curso avanzado."
            cardURL="/Cursos"
            cardBgColor="#F0F0F0"
            cardTitleTextColor="#831d16"
            cardTextColor="#E7473C"
            cardWithImage={false}
          />
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
        <h2 className="text-xl font-bold mb-5">Investigaciones Recientes</h2>
        <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
          <CarouselContent>
            {RESEARCH_CARDS.map((research, index) => (
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
      </section>
    </main>
  );
}
