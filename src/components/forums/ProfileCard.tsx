// app/components/forums/ProfileCard.tsx
import Link from 'next/link';
import Image from 'next/image';

// Definimos la estructura de datos que espera la tarjeta
export interface Profile {
  slug: string;
  name: string;
  role: string;
  imageUrl: string;
}

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link href={`/foros/${profile.slug}`} className="block group">
      <div className="bg-white rounded-2xl p-4 shadow-sm h-full group-hover:shadow-md transition-shadow">
        <Image
          src={profile.imageUrl}
          alt={`Foto de ${profile.name}`}
          width={400}
          height={400}
          className="rounded-xl object-cover w-full aspect-square mb-4"
        />
        <h3 className="font-semibold text-lg text-zinc-900">{profile.name}</h3>
        <p className="text-zinc-500 text-sm">{profile.role}</p>
      </div>
    </Link>
  );
}