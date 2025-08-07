// app/components/home/CourseCard.tsx
import Link from 'next/link';

// Definimos la "forma" que tendrán los datos de un curso
export interface Course {
  slug: string;
  title: string;
  description: string;
}

// El componente recibe un 'course' como prop
export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/cursos/${course.slug}`} className="block">
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:bg-neutral-50 transition-colors">
        <h4 className="font-semibold text-lg text-zinc-900 mb-1">{course.title}</h4>
        <p className="text-zinc-600">{course.description}</p>
      </div>
    </Link>
  );
}