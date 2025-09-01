import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-grow px-20 py-10 h-[100%]">
      <h1 className="text-2xl font-bold mb-5">Red de Mujeres Académicas UNA</h1>
      <p>
        Únete a la Red de Mujeres Académicas, una plataforma para visibilizar logros,
        compartir conocimientos y conectar con la comunidad. Publica cursos, participa
        en foros y accede a información clave con tecnología avanzada e inteligencia artificial.
      </p>
      <Link href="/Registrarse" className="inline-block mt-5 bg-gray-800 text-white px-4 py-2 rounded">Unete Aquí</Link>
      <Image
        src="/images/portada.png"
        alt="Portada de la Red de Mujeres Académicas UNA"
        width={500}
        height={300}
        className="mt-5 w-full h-90 object-cover rounded"
      />
      <section>
        <h2 className="text-xl font-bold mt-10">Herramientas de la Red</h2>
        <div className="mt-4 flex gap-10">
          <div className="w-full flex-grow">
            <Image
              src="/images/tool1.png"
              alt="Portada de la Red de Mujeres Académicas UNA"
              width={200}
              height={75}
              className="object-cover rounded w-full max-h-60"
            />
            <div className="mt-3">
              <Link href="/Foros" className="font-bold">Foros de discusión</Link>
              <p className="text-gray-600">
                Revisa los foros con toda la información de cada una de las mujeres de la Red.
              </p>
            </div>
          </div>
          <div className="w-full flex-grow">
            <Image
              src="/images/tool2.png"
              alt="Portada de la Red de Mujeres Académicas UNA"
              width={200}
              height={75}
              className="object-cover rounded w-full max-h-60"
            />
            <div className="mt-3">
              <Link href="/Cursos" className="font-bold">Cursos en línea</Link>
              <p className="text-gray-600">
                Accede a una variedad de cursos en línea diseñados para empoderar a las mujeres académicas.
              </p>
            </div>
          </div>
          <div className="w-full flex-grow">
            <Image
              src="/images/tool3.png"
              alt="Portada de la Red de Mujeres Académicas UNA"
              width={200}
              height={75}
              className="object-cover rounded w-full max-h-60"
            />
            <div className="mt-3">
              <Link href="/Investigaciones" className="font-bold">Recursos de investigación</Link>
              <p className="text-gray-600">
                Explora una colección de recursos de investigación para apoyar tu trabajo académico.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mt-10 mb-5">Foros Destacados</h2>
        <div className="flex gap-5">
          <div>
            <Image src="/images/pilar.png" alt="Foro 1" width={200} height={100} className="object-cover rounded w-full max-h-70" />
            <div className="mt-3">
              <Link href="/Foros" className="font-bold">Pilar Aranda</Link>
              <p className="text-gray-600">
                Pilar Aranda Ramírez es catedrática de Fisiología y doctora en Farmacia con una amplia
                trayectoria docente e investigadora.
              </p>
            </div>
          </div>
          <div>
            <Image src="/images/tatiana.png" alt="Foro 1" width={200} height={100} className="object-cover rounded w-full max-h-70" />
            <div className="mt-3">
              <Link href="/Foros" className="font-bold">Tatiana López</Link>
              <p className="text-gray-600">
                Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la
                Universidad Nacional Autónoma de México (UNAM).
              </p>
            </div>
          </div>
        </div>
      </section>
      <section>
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
      <section>
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
