// app/(main)/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ForumCarousel, type ForumPost } from '@/components/home/ForumCarousel';
import { CourseCard, type Course } from '@/components/home/CourseCard';

// Datos de ejemplo (sin cambios)
const DUMMY_FORUMS: ForumPost[] = [
  { slug: 'pilar-aranda', authorName: 'Pilar Aranda', authorDescription: 'Catedrática de Fisiología y doctora en Farmacia.', imageUrl: 'https://picsum.photos/seed/aranda/800/600' },
  { slug: 'tatiana-aguilar', authorName: 'Tatiana Aguilar', authorDescription: 'Psicóloga graduada de la Universidad de Costa Rica.', imageUrl: 'https://picsum.photos/seed/aguilar/800/600' },
  { slug: 'ana-sanchez', authorName: 'Ana Sánchez', authorDescription: 'Investigadora en biotecnología, enfocada en materiales.', imageUrl: 'https://picsum.photos/seed/sanchez/800/600' },
  { slug: 'laura-mora', authorName: 'Laura Mora', authorDescription: 'Experta en derecho internacional y derechos humanos.', imageUrl: 'https://picsum.photos/seed/mora/800/600' },
];
const DUMMY_COURSES: Course[] = [
  { slug: 'competencias-stem', title: 'Curso Competencias STEM', description: 'Fortalece tus competencias STEM y explora las nuevas tecnologías.'},
  { slug: 'habilidades-blandas', title: 'Curso Habilidades Blandas', description: 'Mejora tus habilidades de comunicación efectiva, trabajo en equipo y creatividad.' },
  { slug: 'liderazgo-academico', title: 'Curso Liderazgo', description: 'Aprende a liderar un equipo utilizando las mejores prácticas.' },
];

export default function HomePage() {
  const forums = DUMMY_FORUMS;
  const courses = DUMMY_COURSES;

  return (
    <main>
      {/* ... Hero Section y Herramientas (sin cambios) ... */}
      <section className="text-center py-28 px-6">
        <h1 className="text-4xl md:text-6xl font-semibold mb-5 text-zinc-900">
          Red de Mujeres Académicas
        </h1>
        <p className="max-w-3xl mx-auto text-zinc-600 text-lg md:text-xl mb-10">
          Una plataforma para visibilizar logros, compartir conocimientos y conectar con la comunidad académica.
        </p>
        <Link href="/sign-up">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-base">
            Únete Aquí
          </button>
        </Link>
      </section>

      <section className="py-24 px-6 md:px-12 bg-neutral-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-semibold text-center text-zinc-900 mb-16">Herramientas de la Red</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-xl mb-2 text-zinc-900">Foros</h3>
              <p className="text-zinc-600">Participa en debates, comparte ideas y resuelve dudas con la comunidad.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-xl mb-2 text-zinc-900">Cursos</h3>
              <p className="text-zinc-600">Accede a formación especializada impartida por académicas destacadas.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-xl mb-2 text-zinc-900">Investigaciones</h3>
              <p className="text-zinc-600">Publica tus hallazgos y explora el trabajo de otras investigadoras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Foros y Cursos Destacados */}
      <section className="py-24 px-6 md:px-12 bg-neutral-100">
        <div className="max-w-6xl mx-auto">
          {/* --- Renderizamos el componente del carrusel --- */}
          {/* La sección entera del carrusel ahora es más limpia */}
          <div className="mb-24">
            <ForumCarousel forums={forums} options={{ loop: true }} />
          </div>

          {/* ... Cursos Destacados (sin cambios) ... */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-semibold text-zinc-900 mb-8">Cursos Destacados</h2>
              <div className="space-y-4">
                {courses.map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))}
              </div>
              <div className="mt-8">
                <Link href="/cursos">
                  <button className="bg-neutral-200 text-zinc-800 px-6 py-2 rounded-full font-semibold hover:bg-neutral-300 transition-colors text-base">
                    Ver Todos los Cursos
                  </button>
                </Link>
              </div>
            </div>
            <div>
              <Image
                src="https://picsum.photos/seed/workshop/800/900"
                alt="Taller de mujeres académicas"
                width={800}
                height={900}
                className="rounded-2xl object-cover shadow-sm w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}