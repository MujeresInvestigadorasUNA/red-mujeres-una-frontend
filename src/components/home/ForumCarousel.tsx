// app/components/home/ForumCarousel.tsx
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType } from 'embla-carousel-react';
import Image from 'next/image';
// --- 1. Se importan los íconos de las flechas ---
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ForumPost {
  slug: string;
  authorName: string;
  authorDescription: string;
  imageUrl: string;
}

type PropType = {
  forums: ForumPost[];
  options?: EmblaOptionsType;
};

export function ForumCarousel({ forums, options }: PropType) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  // --- 2. Lógica para activar/desactivar los botones ---
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div>
      {/* --- 3. Aquí se muestran el título y los botones --- */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-semibold text-zinc-900">Foros Destacados</h2>
        <div className="flex gap-2">
          <button
            className="embla__button embla__button--prev"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="embla__button embla__button--next"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {forums.map((forum, index) => (
            <div className="embla__slide" key={index}>
              {/* ... Contenido de la tarjeta ... */}
              <div className="bg-white rounded-2xl p-4 shadow-sm h-full">
                <Image
                  src={forum.imageUrl}
                  alt={forum.authorName}
                  width={800}
                  height={600}
                  className="rounded-xl object-cover w-full h-64 mb-6"
                />
                <h3 className="font-semibold text-xl text-zinc-900 px-2">{forum.authorName}</h3>
                <p className="text-zinc-600 text-base mt-2 px-2">{forum.authorDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}