import Image from "next/image";
import Link from "next/link";
import Carousel from "./components/Carousel";
import Card from "./components/Card";

export default function Home() {
  return (
    <main className="flex-grow h-[100%]">
      <section className="bg-[#E7473C] px-20 py-10 text-[#F0F0F0] min-h-[calc(100vh-80px)]">
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
          <Carousel />
        </div>
      </section>
      <section className="px-20 py-10 toolsSection">
        <h2 className="text-xl font-bold mt-10">Herramientas de la Red</h2>
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
      <section className="px-20 py-10 bg-[#b62116]">
        <h2 className="text-xl font-bold mt-10 mb-5">Cursos Populares</h2>
        <div className="flex gap-5">
          <div className="flex flex-col">
            <Link href="/Cursos" className="font-bold">Introducción a la Investigación Académica</Link>
            <p className="text-gray-600">
              Un curso básico para entender los fundamentos de la investigación académica.
            </p>
            <Link href="/Cursos" className="font-bold mt-10">Introducción a la Investigación Académica</Link>
            <p className="text-gray-600">
              Un curso básico para entender los fundamentos de la investigación académica.
            </p>
            <Link href="/Cursos" className="font-bold mt-10">Introducción a la Investigación Académica</Link>
            <p className="text-gray-600">
              Un curso básico para entender los fundamentos de la investigación académica.
            </p>
            <Link href="/Cursos" className="mt-7 bg-gray-800 text-white text-center px-4 py-2 rounded">Ver Todos</Link>
          </div>
          <Image src="/images/cursos.png" alt="Curso 1" width={200} height={100} className="object-cover rounded w-full h-100" />
        </div>
      </section>
      <section className="px-20 py-10 bg-[#FBE9EC]">
        <h2 className="text-xl font-bold mt-10 mb-5">Investigaciones Recientes</h2>
        <div className="flex gap-5">
          <div>
            <Image
              src="/images/investigacion1.png"
              alt="Foro 1"
              width={200}
              height={100}
              className="object-cover rounded w-full h-100 max-h-60"
            />
            <div className="mt-3">
              <Link href="/Investigaciones" className="font-bold">Qué es la Fisiología Digestiva</Link>
              <p className="text-gray-600">
                Pilar Aranda Ramírez es catedrática de Fisiología y doctora en Farmacia con una amplia
                trayectoria docente e investigadora.
              </p>
            </div>
          </div>
          <div>
            <Image
              src="/images/investigacion2.png"
              alt="Foro 1"
              width={200}
              height={100}
              className="object-cover rounded w-full h-100 max-h-60"
            />
            <div className="mt-3">
              <Link href="/Investigaciones" className="font-bold">Aprende de Nutrición y Tecnología</Link>
              <p className="text-gray-600">
                Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad
                Nacional Autónoma de México (UNAM).
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
