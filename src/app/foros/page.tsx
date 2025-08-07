// app/foros/page.tsx
import { ForumGrid } from '@/components/forums/ForumGrid';
import { type Profile } from '@/components/forums/ProfileCard';

// --- DATOS DE EJEMPLO ACTUALIZADOS CON IMÁGENES DE UNSPLASH ---
const DUMMY_PROFILES: Profile[] = [
  { 
    slug: 'pilar-aranda', 
    name: 'Pilar Aranda', 
    role: 'Catedrática de Fisiología', 
    imageUrl: 'https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    slug: 'tatiana-aguilar', 
    name: 'Tatiana Aguilar', 
    role: 'Psicóloga', 
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=800&auto=format&fit=crop'
  },
  { 
    slug: 'maria-arguedas', 
    name: 'Maria Arguedas', 
    role: 'Bioeticista', 
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop'
  },
  { 
    slug: 'maria-jose-chaves', 
    name: 'Maria José Chaves', 
    role: 'Investigadora del CIEM', 
    imageUrl: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=800&auto=format&fit=crop'
  },
  { 
    slug: 'amanda-mesen', 
    name: 'Amanda Mesén', 
    role: 'Investigadora', 
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
  },
  { 
    slug: 'carolina-rojas', 
    name: 'Carolina Rojas', 
    role: 'Directora, Investigadora', 
    imageUrl: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?q=80&w=800&auto=format&fit=crop'
  },
];

export default function ForosPage() {
  const profiles = DUMMY_PROFILES;

  return (
    <div className="bg-neutral-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold mb-3 text-zinc-900">Foros</h1>
        <p className="text-lg text-zinc-600 mb-12 max-w-3xl">
          Encuentra aquí los foros de cada una de las integrantes de la Red de Mujeres Académicas, con su información más relevante, sus logros y sus investigaciones.
        </p>

        {/* El componente del grid interactivo renderiza los perfiles */}
        <ForumGrid profiles={profiles} />
      </div>
    </div>
  );
}