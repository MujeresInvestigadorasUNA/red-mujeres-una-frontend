// app/components/forums/ForumGrid.tsx
"use client";

import { useState, useMemo } from 'react';
import { ProfileCard, type Profile } from './ProfileCard';

export function ForumGrid({ profiles }: { profiles: Profile[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('mas-vistos');

  // Usamos useMemo para que la lista solo se recalcule si cambia la búsqueda o el filtro
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile =>
      profile.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // En el futuro, la lógica de 'filterBy' se podría añadir aquí.
    // Ejemplo: if (filterBy === 'catedraticas') return profiles.filter(p => p.role.includes('Catedrática'));
  }, [profiles, searchTerm, filterBy]);

  return (
    <div>
      {/* Barra de Búsqueda y Filtro */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-grow">
          <label htmlFor="search" className="block text-sm font-medium text-zinc-700 mb-1">
            Buscar
          </label>
          <input
            id="search"
            type="text"
            placeholder="Ingresar Valor a Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-64">
          <label htmlFor="filter" className="block text-sm font-medium text-zinc-700 mb-1">
            Filtrar Por
          </label>
          <select
            id="filter"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mas-vistos">Más Vistos</option>
            <option value="recientes">Recientes</option>
            <option value="catedraticas">Catedráticas</option>
          </select>
        </div>
      </div>

      {/* Grid de Perfiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProfiles.map((profile) => (
          <ProfileCard key={profile.slug} profile={profile} />
        ))}
      </div>
    </div>
  );
}