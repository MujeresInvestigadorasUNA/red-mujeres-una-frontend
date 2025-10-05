import Image from "next/image";
import Link from "next/link";
import Carousel from "./components/Carousel";
import Card from "./components/Card";

const FORUMS_CARDS = [
  {
    id: 1,
    image: "/images/pilar.png",
    title: "Pilar Aranda",
    description:
      "Pilar Aranda Ramírez es catedrática de Fisiología y doctora en Farmacia con una amplia trayectoria docente e investigadora.",
    url: "/Foros"
  },
  {
    id: 2,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
  
    url: "/Foros"
  },
  {
    id: 3,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },
  {
    id: 4,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },{
    id: 5,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
  },{
    id: 6,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },{
    id: 7,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },
];

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
      <section className="bg-[#E7473C] px-20 py-10 text-[#F0F0F0] min-h-[calc(100vh-80px)] mainSection">
        <h1 className="text-2xl font-bold">
          Red de Mujeres Académicas UNA
        </h1>
        <p className="mt-3">
          Únete a la Red de Mujeres Académicas, una plataforma para visibilizar logros,
          compartir conocimientos y conectar con la comunidad. Publica cursos, participa
          en foros y accede a información clave con tecnología avanzada e inteligencia artificial.
        </p>
        <div>
          <h2 className="text-xl font-bold mt-10 mb-5">Foros Destacados</h2>
          <Carousel cards={FORUMS_CARDS} />
        </div>
      </section>
      <section className="px-20 py-10 toolsSection">
        <h2 className="text-[#E7473C] text-xl font-bold">Herramientas de la Red</h2>
        <div className="mt-4 flex gap-5">
          <Card 
            cardImage="/images/tool1.png"
            cardTitle="Foros de discusión"
            cardDescription="Revisa los foros con toda la información de 
            cada una de las mujeres de la Red."
            cardURL="/Foros"
            cardBgColor="#E7473C"
            cardTitleTextColor="#F0F0F0"
            cardTextColor="#F0F0F0"
          />
          <Card 
            cardImage="/images/tool2.png"
            cardTitle="Cursos en línea"
            cardDescription="Accede a una variedad de cursos en línea diseñados 
            para empoderar a las mujeres académicas."
            cardURL="/Cursos"
            cardBgColor="#E7473C"
            cardTitleTextColor="#F0F0F0"
            cardTextColor="#F0F0F0"
          />
          <Card
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
      </section>
      <section className="flex gap-10 px-20 py-10 bg-[#b62116] text-[#F0F0F0] cursesSection">
        <div className="flex flex-col gap-2 w-1/3">
          <h2 className="text-xl font-bold mb-2">Cursos Populares</h2>
          <Card 
            cardWithImage={false}
            cardTitle="Introducción a la Investigación Académica"
            cardDescription="Un curso básico para entender los fundamentos de la investigación académica."
            cardURL="/Cursos"
            cardBgColor="#F0F0F0"
            cardTitleTextColor="#831d16"
          />
          <Card 
            cardWithImage={false}
            cardTitle="Gestión del Tiempo para Académicas"
            cardDescription="Aprende técnicas efectivas de gestión del tiempo para equilibrar tus responsabilidades académicas y personales."
            cardURL="/Cursos"
            cardBgColor="#F0F0F0"
            cardTitleTextColor="#831d16"
          />
          <Card 
            cardWithImage={false}
            cardTitle="Redacción Académica Avanzada"
            cardDescription="Mejora tus habilidades de redacción académica con este curso avanzado."
            cardURL="/Cursos"
            cardBgColor="#F0F0F0"
            cardTitleTextColor="#831d16"
          />
          <Link 
            href="/Cursos" 
            className="bg-[#E7473C] text-white text-center px-4 py-2 rounded
            shadow"
          >
            Ver Todos
          </Link>
        </div>
        <div className="w-2/3 h-full bg-white rounded shadow-md p-3">
          <Image 
            src="/images/cursos.png" 
            alt="Curso 1" 
            width={200} 
            height={200} 
            className="object-cover rounded w-full h-100 bg-[#fff] " 
          />
        </div>
      </section>
      <section className="px-10 py-10 toolsSection">
        <h2 className="text-xl font-bold mb-5 px-10">Investigaciones Recientes</h2>
        <Carousel 
          cards={RESEARCH_CARDS} 
          scrollButtonsColor="#F0F0F0"
          scrollButtonsBgColor="#E7473C"
        />
      </section>
    </main>
  );
}
